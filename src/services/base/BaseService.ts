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
      const headers: Record<string, string> = {
         "Content-Type": "application/json",
         Authorization: `Bearer ${this.config.apiKey}`,
         ...this.config.headers,
         ...requestOptions.headers,
      };

      // Add X-App-ID header if appId is provided in request or config
      const appId = requestOptions.appId || this.config.appId;
      if (appId) {
         headers["X-App-ID"] = appId;
      }

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

      return this.makeRequestWithRetry<T>(
         url,
         requestOptions_,
         retryConfig,
         requestOptions.fallback_model || this.config.fallback_model
      );
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
      const headers: Record<string, string> = {
         "Content-Type": "application/json",
         Authorization: `Bearer ${this.config.apiKey}`,
         ...this.config.headers,
         ...requestOptions.headers,
      };

      // Add X-App-ID header if appId is provided in request or config
      const appId = requestOptions.appId || this.config.appId;
      if (appId) {
         headers["X-App-ID"] = appId;
      }

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
         // If we have a fallback model and this is a model-related error, try with fallback
         const fallbackModel =
            requestOptions.fallback_model || this.config.fallback_model;
         if (fallbackModel && this.shouldTryFallback(error)) {
            return this.tryStreamWithFallbackModel(
               url,
               requestOptions_,
               fallbackModel
            );
         }

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
    * Makes a request to the API and returns the raw response body as Buffer (for audio, etc)
    */
   protected async makeRawRequest(
      endpoint: string,
      options: RequestInit = {},
      requestOptions: RequestOptions = {}
   ): Promise<{ buffer: Buffer; contentType: string }> {
      const url = `${this.config.baseUrl}${endpoint}`;
      const timeout = requestOptions.timeout || this.config.timeout;
      const headers: Record<string, string> = {
         "Content-Type": "application/json",
         Authorization: `Bearer ${this.config.apiKey}`,
         ...this.config.headers,
         ...requestOptions.headers,
      };

      // Add X-App-ID header if appId is provided in request or config
      const appId = requestOptions.appId || this.config.appId;
      if (appId) {
         headers["X-App-ID"] = appId;
      }

      const requestOptions_: RequestInit = {
         ...options,
         headers,
         signal: requestOptions.signal || AbortSignal.timeout(timeout),
      };

      const response = await this.fetchImpl(url, requestOptions_);
      if (!response.ok) {
         await this.handleErrorResponse(response);
      }
      const contentType =
         response.headers.get("content-type") || "application/octet-stream";
      const arrayBuffer = await response.arrayBuffer();
      return { buffer: Buffer.from(arrayBuffer), contentType };
   }

   /**
    * Makes a request with retry logic
    */
   private async makeRequestWithRetry<T>(
      url: string,
      options: RequestInit,
      retryConfig: RetryConfig,
      fallbackModel?: string
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
               // If we have a fallback model and this is a model-related error, try with fallback
               if (fallbackModel && this.shouldTryFallback(error)) {
                  return this.tryWithFallbackModel<T>(
                     url,
                     options,
                     fallbackModel
                  );
               }
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
    * Determines if an error should trigger fallback model usage
    */
   private shouldTryFallback(error: Error): boolean {
      // Try fallback for model-related errors
      const modelErrorKeywords = [
         "model",
         "model not found",
         "model unavailable",
         "model error",
         "invalid model",
         "model not available",
         "model temporarily unavailable",
      ];

      const errorMessage = error.message.toLowerCase();
      return modelErrorKeywords.some((keyword) =>
         errorMessage.includes(keyword)
      );
   }

   /**
    * Attempts the request with a fallback model
    */
   private async tryWithFallbackModel<T>(
      url: string,
      options: RequestInit,
      fallbackModel: string
   ): Promise<T> {
      if (this.config.debug) {
         console.warn(`Trying with fallback model: ${fallbackModel}`);
      }

      try {
         // Parse the request body to update the model
         const body = JSON.parse(options.body as string);
         const originalModel = body.model;

         // Update the model to fallback model
         body.model = fallbackModel;

         // Create new options with updated body
         const fallbackOptions: RequestInit = {
            ...options,
            body: JSON.stringify(body),
         };

         const response = await this.fetchImpl(url, fallbackOptions);

         if (!response.ok) {
            await this.handleErrorResponse(response);
         }

         const result = await response.json();

         if (this.config.debug) {
            console.warn(
               `Successfully used fallback model: ${fallbackModel} (original: ${originalModel})`
            );
         }

         return result;
      } catch (error) {
         if (this.config.debug) {
            console.error(
               `Fallback model ${fallbackModel} also failed:`,
               error
            );
         }
         throw error;
      }
   }

   /**
    * Attempts the streaming request with a fallback model
    */
   private async tryStreamWithFallbackModel(
      url: string,
      options: RequestInit,
      fallbackModel: string
   ): Promise<ReadableStream<Uint8Array>> {
      if (this.config.debug) {
         console.warn(
            `Trying with fallback model for streaming: ${fallbackModel}`
         );
      }

      try {
         // Parse the request body to update the model
         const body = JSON.parse(options.body as string);
         const originalModel = body.model;

         // Update the model to fallback model
         body.model = fallbackModel;

         // Create new options with updated body
         const fallbackOptions: RequestInit = {
            ...options,
            body: JSON.stringify(body),
         };

         const response = await this.fetchImpl(url, fallbackOptions);

         if (!response.ok) {
            await this.handleErrorResponse(response);
         }

         if (!response.body) {
            throw new LunosError("No response body for streaming request", 0);
         }

         if (this.config.debug) {
            console.warn(
               `Successfully used fallback model for streaming: ${fallbackModel} (original: ${originalModel})`
            );
         }

         return response.body;
      } catch (error) {
         if (this.config.debug) {
            console.error(
               `Fallback model ${fallbackModel} also failed for streaming:`,
               error
            );
         }
         throw error;
      }
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
