import { LunosConfig, RequestOptions } from "../../client/config/ClientConfig";
import {
   LunosError,
   APIError,
   AuthenticationError,
   RateLimitError,
   NetworkError,
   ValidationError,
} from "../../client/errors/LunosError";
import { ValidationUtils } from "../../utils/validation";
import { RetryConfig } from "../../types/common";

export abstract class BaseService {
   protected config: LunosConfig;
   protected fetchImpl: typeof fetch;

   constructor(config: LunosConfig) {
      this.config = config;
      this.fetchImpl = config.fetch || fetch;
   }

   /**
    * Makes a request to the API with retry logic and error handling
    */
   protected async makeRequest<T>(
      endpoint: string,
      options: RequestInit = {},
      requestOptions: RequestOptions = {}
   ): Promise<T> {
      const url = `${this.config.baseUrl}${endpoint}`;
      const timeout = requestOptions.timeout || this.config.timeout;
      const headers = {
         "Content-Type": "application/json",
         Authorization: `Bearer ${this.config.apiKey}`,
         ...this.config.headers,
         ...requestOptions.headers,
      };

      const requestOptions_: RequestInit = {
         ...options,
         headers,
         signal: requestOptions.signal || AbortSignal.timeout(timeout),
      };

      const retryConfig: RetryConfig = {
         maxRetries: this.config.retries,
         baseDelay: this.config.retryDelay,
         maxDelay: 10000,
         exponentialBackoff: true,
         retryStatusCodes: [408, 429, 500, 502, 503, 504],
      };

      return this.makeRequestWithRetry<T>(url, requestOptions_, retryConfig);
   }

   /**
    * Makes a streaming request to the API
    */
   protected async makeStreamRequest(
      endpoint: string,
      options: RequestInit = {},
      requestOptions: RequestOptions = {}
   ): Promise<ReadableStream<Uint8Array>> {
      const url = `${this.config.baseUrl}${endpoint}`;
      const timeout = requestOptions.timeout || this.config.timeout;
      const headers = {
         "Content-Type": "application/json",
         Authorization: `Bearer ${this.config.apiKey}`,
         ...this.config.headers,
         ...requestOptions.headers,
      };

      const requestOptions_: RequestInit = {
         ...options,
         headers,
         signal: requestOptions.signal || AbortSignal.timeout(timeout),
      };

      try {
         const response = await this.fetchImpl(url, requestOptions_);

         if (!response.ok) {
            await this.handleErrorResponse(response);
         }

         if (!response.body) {
            throw new LunosError("No response body for streaming request", 0);
         }

         return response.body;
      } catch (error) {
         if (error instanceof LunosError) {
            throw error;
         }
         throw new NetworkError(
            `Network error: ${
               error instanceof Error ? error.message : String(error)
            }`
         );
      }
   }

   /**
    * Makes a request with retry logic
    */
   private async makeRequestWithRetry<T>(
      url: string,
      options: RequestInit,
      retryConfig: RetryConfig
   ): Promise<T> {
      let lastError: Error;

      for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
         try {
            const response = await this.fetchImpl(url, options);

            if (!response.ok) {
               await this.handleErrorResponse(response);
            }

            return await response.json();
         } catch (error) {
            lastError =
               error instanceof Error ? error : new Error(String(error));

            // Don't retry on certain errors
            if (
               error instanceof AuthenticationError ||
               error instanceof ValidationError
            ) {
               throw error;
            }

            // Check if we should retry
            if (attempt === retryConfig.maxRetries) {
               throw lastError;
            }

            // Calculate delay
            const delay = this.calculateRetryDelay(attempt, retryConfig);

            if (this.config.debug) {
               console.warn(
                  `Request failed, retrying in ${delay}ms (attempt ${
                     attempt + 1
                  }/${retryConfig.maxRetries + 1})`
               );
            }

            await this.sleep(delay);
         }
      }

      throw lastError!;
   }

   /**
    * Handles error responses from the API
    */
   private async handleErrorResponse(response: Response): Promise<never> {
      let errorMessage: string;
      let errorDetails: any;

      try {
         const errorData = await response.json();
         errorMessage = errorData.error?.message || `HTTP ${response.status}`;
         errorDetails = errorData.error;
      } catch {
         errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      switch (response.status) {
         case 401:
            throw new AuthenticationError(errorMessage);
         case 429:
            const retryAfter = response.headers.get("retry-after");
            throw new RateLimitError(
               errorMessage,
               retryAfter ? parseInt(retryAfter) : undefined
            );
         case 400:
            throw new LunosError(
               errorMessage,
               response.status,
               "BAD_REQUEST",
               errorDetails
            );
         case 403:
            throw new LunosError(
               errorMessage,
               response.status,
               "FORBIDDEN",
               errorDetails
            );
         case 404:
            throw new LunosError(
               errorMessage,
               response.status,
               "NOT_FOUND",
               errorDetails
            );
         case 500:
         case 502:
         case 503:
         case 504:
            throw new LunosError(
               errorMessage,
               response.status,
               "SERVER_ERROR",
               errorDetails
            );
         default:
            throw new APIError(errorMessage, response.status);
      }
   }

   /**
    * Calculates retry delay with exponential backoff
    */
   private calculateRetryDelay(
      attempt: number,
      retryConfig: RetryConfig
   ): number {
      if (!retryConfig.exponentialBackoff) {
         return retryConfig.baseDelay;
      }

      const delay = retryConfig.baseDelay * Math.pow(2, attempt);
      return Math.min(delay, retryConfig.maxDelay);
   }

   /**
    * Sleep utility
    */
   private sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
   }

   /**
    * Validates the service configuration
    */
   protected validateConfig(): void {
      ValidationUtils.validateApiKey(this.config.apiKey);
      ValidationUtils.validateBaseUrl(this.config.baseUrl);
      ValidationUtils.validateTimeout(this.config.timeout);
      ValidationUtils.validateRetryConfig(
         this.config.retries,
         this.config.retryDelay
      );
   }

   /**
    * Logs debug information if debug mode is enabled
    */
   protected log(message: string, data?: any): void {
      if (this.config.debug) {
         console.log(`[Lunos Debug] ${message}`, data || "");
      }
   }
}
