import { ValidationError } from "../client/errors/LunosError";
import { ChatCompletionRequest } from "../types/chat";
import { ImageGenerationRequest } from "../types/image";
import { AudioGenerationRequest } from "../types/audio";
import { EmbeddingRequest } from "../types/embedding";

export class ValidationUtils {
   /**
    * Validates a chat completion request
    */
   static validateChatCompletionRequest(request: ChatCompletionRequest): void {
      if (
         !request.messages ||
         !Array.isArray(request.messages) ||
         request.messages.length === 0
      ) {
         throw new ValidationError(
            "Messages array is required and cannot be empty"
         );
      }

      for (const message of request.messages) {
         if (!message.role || !message.content) {
            throw new ValidationError(
               "Each message must have a role and content"
            );
         }

         if (
            !["system", "user", "assistant", "function", "tool"].includes(
               message.role
            )
         ) {
            throw new ValidationError(`Invalid role: ${message.role}`);
         }
      }

      if (
         request.temperature !== undefined &&
         (request.temperature < 0 || request.temperature > 2)
      ) {
         throw new ValidationError("Temperature must be between 0 and 2");
      }

      if (
         request.top_p !== undefined &&
         (request.top_p < 0 || request.top_p > 1)
      ) {
         throw new ValidationError("Top_p must be between 0 and 1");
      }

      if (request.max_tokens !== undefined && request.max_tokens < 1) {
         throw new ValidationError("Max_tokens must be at least 1");
      }

      if (
         request.presence_penalty !== undefined &&
         (request.presence_penalty < -2 || request.presence_penalty > 2)
      ) {
         throw new ValidationError("Presence penalty must be between -2 and 2");
      }

      if (
         request.frequency_penalty !== undefined &&
         (request.frequency_penalty < -2 || request.frequency_penalty > 2)
      ) {
         throw new ValidationError(
            "Frequency penalty must be between -2 and 2"
         );
      }
   }

   /**
    * Validates an image generation request
    */
   static validateImageGenerationRequest(
      request: ImageGenerationRequest
   ): void {
      if (
         !request.prompt ||
         typeof request.prompt !== "string" ||
         request.prompt.trim().length === 0
      ) {
         throw new ValidationError("Prompt is required and cannot be empty");
      }

      if (request.n !== undefined && (request.n < 1 || request.n > 10)) {
         throw new ValidationError("Number of images must be between 1 and 10");
      }

      if (
         request.size &&
         ![
            "256x256",
            "512x512",
            "1024x1024",
            "1792x1024",
            "1024x1792",
         ].includes(request.size)
      ) {
         throw new ValidationError(
            "Invalid size. Must be one of: 256x256, 512x512, 1024x1024, 1792x1024, 1024x1792"
         );
      }

      if (
         request.width !== undefined &&
         (request.width < 256 || request.width > 1792)
      ) {
         throw new ValidationError("Width must be between 256 and 1792");
      }

      if (
         request.height !== undefined &&
         (request.height < 256 || request.height > 1792)
      ) {
         throw new ValidationError("Height must be between 256 and 1792");
      }

      if (request.quality && !["standard", "hd"].includes(request.quality)) {
         throw new ValidationError('Quality must be either "standard" or "hd"');
      }

      if (
         request.response_format &&
         !["url", "b64_json"].includes(request.response_format)
      ) {
         throw new ValidationError(
            'Response format must be either "url" or "b64_json"'
         );
      }

      if (request.style && !["vivid", "natural"].includes(request.style)) {
         throw new ValidationError('Style must be either "vivid" or "natural"');
      }
   }

   /**
    * Validates an audio generation request
    */
   static validateAudioGenerationRequest(
      request: AudioGenerationRequest
   ): void {
      if (
         !request.input ||
         typeof request.input !== "string" ||
         request.input.trim().length === 0
      ) {
         throw new ValidationError(
            "Input text is required and cannot be empty"
         );
      }

      if (request.input.length > 4096) {
         throw new ValidationError("Input text cannot exceed 4096 characters");
      }

      if (
         request.voice &&
         !["alloy", "echo", "fable", "onyx", "nova", "shimmer"].includes(
            request.voice
         )
      ) {
         throw new ValidationError(
            "Invalid voice. Must be one of: alloy, echo, fable, onyx, nova, shimmer"
         );
      }

      if (
         request.response_format &&
         !["mp3", "opus", "aac", "flac"].includes(request.response_format)
      ) {
         throw new ValidationError(
            "Response format must be one of: mp3, opus, aac, flac"
         );
      }

      if (
         request.speed !== undefined &&
         (request.speed < 0.25 || request.speed > 4.0)
      ) {
         throw new ValidationError("Speed must be between 0.25 and 4.0");
      }
   }

   /**
    * Validates an embedding request
    */
   static validateEmbeddingRequest(request: EmbeddingRequest): void {
      if (!request.input) {
         throw new ValidationError("Input is required");
      }

      if (typeof request.input === "string") {
         if (request.input.trim().length === 0) {
            throw new ValidationError("Input text cannot be empty");
         }
      } else if (Array.isArray(request.input)) {
         if (request.input.length === 0) {
            throw new ValidationError("Input array cannot be empty");
         }
         for (const text of request.input) {
            if (typeof text !== "string" || text.trim().length === 0) {
               throw new ValidationError(
                  "All input texts must be non-empty strings"
               );
            }
         }
      } else {
         throw new ValidationError(
            "Input must be a string or array of strings"
         );
      }

      if (
         request.encoding_format &&
         !["float", "base64"].includes(request.encoding_format)
      ) {
         throw new ValidationError(
            'Encoding format must be either "float" or "base64"'
         );
      }

      if (request.dimensions !== undefined && request.dimensions < 1) {
         throw new ValidationError("Dimensions must be at least 1");
      }
   }

   /**
    * Validates API key format
    */
   static validateApiKey(apiKey: string): void {
      if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
         throw new ValidationError("API key is required");
      }

      if (apiKey.length < 10) {
         throw new ValidationError("API key appears to be invalid (too short)");
      }
   }

   /**
    * Validates base URL format
    */
   static validateBaseUrl(baseUrl: string): void {
      if (!baseUrl || typeof baseUrl !== "string") {
         throw new ValidationError("Base URL is required");
      }

      try {
         new URL(baseUrl);
      } catch {
         throw new ValidationError("Invalid base URL format");
      }
   }

   /**
    * Validates timeout value
    */
   static validateTimeout(timeout: number): void {
      if (typeof timeout !== "number" || timeout < 1000 || timeout > 300000) {
         throw new ValidationError(
            "Timeout must be a number between 1000 and 300000 milliseconds"
         );
      }
   }

   /**
    * Validates retry configuration
    */
   static validateRetryConfig(retries: number, retryDelay: number): void {
      if (typeof retries !== "number" || retries < 0 || retries > 10) {
         throw new ValidationError("Retries must be a number between 0 and 10");
      }

      if (
         typeof retryDelay !== "number" ||
         retryDelay < 100 ||
         retryDelay > 10000
      ) {
         throw new ValidationError(
            "Retry delay must be a number between 100 and 10000 milliseconds"
         );
      }
   }

   /**
    * Validates fallback model configuration
    */
   static validateFallbackModel(fallbackModel?: string): void {
      if (fallbackModel !== undefined) {
         if (
            typeof fallbackModel !== "string" ||
            fallbackModel.trim().length === 0
         ) {
            throw new ValidationError(
               "Fallback model must be a non-empty string"
            );
         }
      }
   }
}
