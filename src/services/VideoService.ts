import { BaseService } from "./base/BaseService";
import {
   VideoGenerationRequest,
   VideoGenerationResponse,
   VideoGenerationStatus,
   VideoGenerationOptions,
} from "../types/video";
import { ValidationUtils } from "../utils/validation";

/**
 * Service for handling video generation operations using Google Veo 3.0.
 * Provides methods for generating cinematic-quality videos with customizable
 * aspect ratios, negative prompts, and output formats.
 */
export class VideoService extends BaseService {
   /**
    * Generates a video based on a text prompt using the Lunos AI API.
    *
    * This method handles the core video generation functionality, validating
    * the request parameters and making the API call to start video generation.
    * The response contains an operation ID that can be used to track progress.
    *
    * @param request - Complete video generation request object containing
    *                  prompt, model, parameters, and other options
    * @returns Promise resolving to VideoGenerationResponse with operation ID
    * @throws Error if request validation fails or API call fails
    *
    * @example
    * ```typescript
    * const response = await client.video.generateVideo({
    *   model: "google/veo-3.0-generate-preview",
    *   prompt: "A cinematic shot of a majestic lion in the savannah.",
    *   parameters: {
    *     aspectRatio: "16:9",
    *     negativePrompt: "cartoon, drawing, low quality"
    *   },
    *   response_format: "mp4",
    *   appId: "my-app"
    * });
    * ```
    */
   async generateVideo(
      request: VideoGenerationRequest
   ): Promise<VideoGenerationResponse> {
      ValidationUtils.validateVideoGenerationRequest(request);
      this.log("Generating video", {
         prompt: request.prompt,
         model: request.model,
         appId: request.appId,
      });

      return this.makeRequest<VideoGenerationResponse>(
         "/v1/video/generations",
         {
            method: "POST",
            body: JSON.stringify(request),
         },
         {
            appId: request.appId,
         }
      );
   }

   /**
    * Checks the status of a video generation operation.
    *
    * This method polls the status endpoint to check if video generation
    * is complete and retrieves the video URL when ready.
    *
    * @param operationId - The operation ID returned from generateVideo
    * @param appId - Optional application identifier
    * @returns Promise resolving to VideoGenerationStatus with current status
    * @throws Error if operation ID is invalid or API call fails
    *
    * @example
    * ```typescript
    * const status = await client.video.getVideoStatus(
    *   "video-op:user123:1703123456789",
    *   "my-app"
    * );
    *
    * if (status.status === "completed") {
    *   console.log("Video URL:", status.video_url);
    * }
    * ```
    */
   async getVideoStatus(
      operationId: string,
      appId?: string
   ): Promise<VideoGenerationStatus> {
      if (!operationId || typeof operationId !== "string") {
         throw new Error("Operation ID is required");
      }

      this.log("Checking video status", { operationId, appId });

      return this.makeRequest<VideoGenerationStatus>(
         `/v1/video/generations/${operationId}`,
         {
            method: "GET",
         },
         {
            appId,
         }
      );
   }

   /**
    * Generates a video and waits for completion.
    *
    * This method starts video generation and polls the status endpoint
    * until the video is ready, then returns the final result.
    *
    * @param request - Video generation request
    * @param pollInterval - Interval in milliseconds between status checks (default: 10000)
    * @param maxWaitTime - Maximum time to wait in milliseconds (default: 300000 = 5 minutes)
    * @returns Promise resolving to VideoGenerationStatus with video URL
    * @throws Error if generation fails or timeout is reached
    *
    * @example
    * ```typescript
    * const result = await client.video.generateVideoAndWait({
    *   model: "google/veo-3.0-generate-preview",
    *   prompt: "A beautiful sunset over mountains",
    *   parameters: {
    *     aspectRatio: "16:9"
    *   }
    * });
    *
    * console.log("Video URL:", result.video_url);
    * ```
    */
   async generateVideoAndWait(
      request: VideoGenerationRequest,
      pollInterval: number = 10000,
      maxWaitTime: number = 300000
   ): Promise<VideoGenerationStatus> {
      const startTime = Date.now();

      // Start video generation
      const response = await this.generateVideo(request);
      this.log("Video generation started", { operationId: response.id });

      // Poll for completion
      while (Date.now() - startTime < maxWaitTime) {
         const status = await this.getVideoStatus(response.id, request.appId);

         if (status.status === "completed") {
            this.log("Video generation completed", {
               operationId: response.id,
               videoUrl: status.video_url,
            });
            return status;
         }

         if (status.status === "failed") {
            throw new Error(
               `Video generation failed: ${status.error || "Unknown error"}`
            );
         }

         // Wait before next poll
         await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }

      throw new Error(`Video generation timeout after ${maxWaitTime}ms`);
   }

   /**
    * Convenience method for simple video generation with structured parameters.
    *
    * This method provides a simplified interface for video generation using
    * a structured object that separates the prompt from other options.
    *
    * @param options - Object containing prompt and optional generation parameters
    * @returns Promise resolving to VideoGenerationResponse with operation ID
    *
    * @example
    * ```typescript
    * const response = await client.video.generate({
    *   prompt: "A futuristic city skyline at night",
    *   model: "google/veo-3.0-generate-preview",
    *   aspectRatio: "16:9",
    *   negativePrompt: "cartoon, low quality",
    *   appId: "my-app"
    * });
    * ```
    */
   async generate(
      options: VideoGenerationOptions
   ): Promise<VideoGenerationResponse> {
      return this.generateVideo({
         model: options.model || "google/veo-3.0-generate-preview",
         prompt: options.prompt,
         parameters: {
            aspectRatio: options.aspectRatio,
            negativePrompt: options.negativePrompt,
         },
         response_format: options.response_format || "mp4",
         user: options.user,
         appId: options.appId,
      });
   }

   /**
    * Convenience method for video generation with default 16:9 aspect ratio.
    *
    * This method automatically sets the aspect ratio to 16:9 for widescreen
    * video generation.
    *
    * @param options - Object containing prompt and other parameters
    * @returns Promise resolving to VideoGenerationResponse with operation ID
    *
    * @example
    * ```typescript
    * const response = await client.video.generateWidescreen({
    *   prompt: "A cinematic car chase scene",
    *   negativePrompt: "cartoon, animation, low quality"
    * });
    * ```
    */
   async generateWidescreen(options: {
      prompt: string;
      model?: string;
      negativePrompt?: string;
      response_format?: "mp4";
      user?: string;
      appId?: string;
   }): Promise<VideoGenerationResponse> {
      return this.generate({
         ...options,
         aspectRatio: "16:9",
      });
   }

   /**
    * Convenience method for video generation with MP4 format.
    *
    * This method automatically sets the response format to MP4.
    *
    * @param options - Object containing prompt and other parameters
    * @returns Promise resolving to VideoGenerationResponse with operation ID
    *
    * @example
    * ```typescript
    * const response = await client.video.generateMP4({
    *   prompt: "A peaceful forest scene with birds",
    *   aspectRatio: "16:9"
    * });
    * ```
    */
   async generateMP4(options: {
      prompt: string;
      model?: string;
      aspectRatio?: "16:9";
      negativePrompt?: string;
      user?: string;
      appId?: string;
   }): Promise<VideoGenerationResponse> {
      return this.generate({
         ...options,
         response_format: "mp4",
      });
   }

   /**
    * Generates a video and returns the final result with video URL.
    *
    * This method combines generation and status polling into a single call,
    * returning the completed video with URL.
    *
    * @param options - Video generation options
    * @param pollInterval - Interval in milliseconds between status checks (default: 10000)
    * @param maxWaitTime - Maximum time to wait in milliseconds (default: 300000 = 5 minutes)
    * @returns Promise resolving to VideoGenerationStatus with video URL
    *
    * @example
    * ```typescript
    * const result = await client.video.generateAndWait({
    *   prompt: "A majestic eagle soaring over mountains",
    *   aspectRatio: "16:9",
    *   negativePrompt: "cartoon, low quality"
    * });
    *
    * console.log("Video ready:", result.video_url);
    * ```
    */
   async generateAndWait(
      options: VideoGenerationOptions,
      pollInterval: number = 10000,
      maxWaitTime: number = 300000
   ): Promise<VideoGenerationStatus> {
      const request: VideoGenerationRequest = {
         model: options.model || "google/veo-3.0-generate-preview",
         prompt: options.prompt,
         parameters: {
            aspectRatio: options.aspectRatio,
            negativePrompt: options.negativePrompt,
         },
         response_format: options.response_format || "mp4",
         user: options.user,
         appId: options.appId,
      };

      return this.generateVideoAndWait(request, pollInterval, maxWaitTime);
   }

   /**
    * Validates video generation parameters for correctness.
    *
    * This static method performs validation on video generation parameters
    * to ensure they meet the API requirements before making requests.
    *
    * @param prompt - Text prompt for video generation
    * @param model - Model identifier
    * @param aspectRatio - Optional aspect ratio
    * @throws Error if parameters are invalid
    *
    * @example
    * ```typescript
    * VideoService.validateVideoGenerationParams(
    *   "A beautiful landscape",
    *   "google/veo-3.0-generate-preview",
    *   "16:9"
    * );
    * ```
    */
   static validateVideoGenerationParams(
      prompt: string,
      model: string,
      aspectRatio?: string
   ): void {
      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
         throw new Error("Prompt is required and cannot be empty");
      }

      if (!model || typeof model !== "string" || model.trim().length === 0) {
         throw new Error("Model is required and cannot be empty");
      }

      if (aspectRatio && aspectRatio !== "16:9") {
         throw new Error("Aspect ratio must be '16:9' or undefined");
      }
   }
}
