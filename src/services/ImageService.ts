import { BaseService } from "./base/BaseService";
import {
   ImageGenerationRequest,
   ImageGenerationResponse,
   ImageEditRequest,
   ImageVariationRequest,
} from "../types/image";
import { ValidationUtils } from "../utils/validation";

/**
 * Service for handling image generation, editing, and variation operations.
 * Provides both low-level API methods and high-level convenience methods
 * for common image generation tasks.
 */
export class ImageService extends BaseService {
   /**
    * Generates an image based on a text prompt using the Lunos AI API.
    *
    * This method handles the core image generation functionality, validating
    * the request parameters and making the API call to generate images.
    *
    * @param request - Complete image generation request object containing
    *                  prompt, model, size, quality, and other parameters
    * @returns Promise resolving to ImageGenerationResponse with generated image data
    * @throws Error if request validation fails or API call fails
    *
    * @example
    * ```typescript
    * const response = await client.image.generateImage({
    *   prompt: "A beautiful sunset over mountains",
    *   model: "openai/dall-e-3",
    *   size: "1024x1024",
    *   quality: "hd",
    *   appId: "my-app"
    * });
    * ```
    */
   async generateImage(
      request: ImageGenerationRequest
   ): Promise<ImageGenerationResponse> {
      ValidationUtils.validateImageGenerationRequest(request);
      this.log("Generating image", {
         prompt: request.prompt,
         model: request.model,
         appId: request.appId,
      });

      return this.makeRequest<ImageGenerationResponse>(
         "/v1/image/generations",
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
    * Edits an existing image based on a text prompt and optional mask.
    *
    * This method allows for inpainting and outpainting operations by providing
    * an existing image and a text prompt describing the desired changes.
    *
    * @param request - Image edit request containing the base image, prompt,
    *                  optional mask, and generation parameters
    * @returns Promise resolving to ImageGenerationResponse with edited image data
    * @throws Error if image is not provided or API call fails
    *
    * @example
    * ```typescript
    * const response = await client.image.editImage({
    *   image: "base64_encoded_image_data",
    *   prompt: "Add a red car to the scene",
    *   model: "openai/dall-e-2",
    *   size: "1024x1024"
    * });
    * ```
    */
   async editImage(
      request: ImageEditRequest
   ): Promise<ImageGenerationResponse> {
      if (!request.image) {
         throw new Error("Image is required for editing");
      }

      this.log("Editing image", {
         prompt: request.prompt,
         model: request.model,
      });
      return this.makeRequest<ImageGenerationResponse>("/v1/image/edits", {
         method: "POST",
         body: JSON.stringify(request),
      });
   }

   /**
    * Creates variations of an existing image.
    *
    * This method generates multiple variations of a provided base image,
    * maintaining the overall composition while introducing subtle changes.
    *
    * @param request - Image variation request containing the base image
    *                  and generation parameters
    * @returns Promise resolving to ImageGenerationResponse with variation image data
    * @throws Error if image is not provided or API call fails
    *
    * @example
    * ```typescript
    * const response = await client.image.createImageVariation({
    *   image: "base64_encoded_image_data",
    *   model: "openai/dall-e-2",
    *   n: 3,
    *   size: "1024x1024"
    * });
    * ```
    */
   async createImageVariation(
      request: ImageVariationRequest
   ): Promise<ImageGenerationResponse> {
      if (!request.image) {
         throw new Error("Image is required for variation");
      }

      this.log("Creating image variation", { model: request.model });
      return this.makeRequest<ImageGenerationResponse>("/v1/image/variations", {
         method: "POST",
         body: JSON.stringify(request),
      });
   }

   /**
    * Convenience method for simple image generation with structured parameters.
    *
    * This method provides a simplified interface for image generation using
    * a structured object that separates the prompt from other options.
    *
    * @param options - Object containing prompt and optional generation parameters
    * @returns Promise resolving to ImageGenerationResponse with generated image data
    *
    * @example
    * ```typescript
    * const response = await client.image.generate({
    *   prompt: "A futuristic city skyline",
    *   model: "openai/dall-e-3",
    *   size: "1024x1024",
    *   quality: "hd",
    *   appId: "my-app"
    * });
    * ```
    */
   async generate(options: {
      prompt: string;
      model?: string;
      size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
      quality?: "standard" | "hd";
      response_format?: "url" | "b64_json";
      style?: "vivid" | "natural";
      n?: number;
      seed?: number;
      user?: string;
      appId?: string;
   }): Promise<ImageGenerationResponse> {
      return this.generateImage({
         prompt: options.prompt,
         model: options.model,
         size: options.size,
         quality: options.quality,
         response_format: options.response_format,
         style: options.style,
         n: options.n,
         seed: options.seed,
         user: options.user,
         appId: options.appId,
      });
   }

   /**
    * Convenience method for image generation with specific dimensions.
    *
    * This method allows for custom image dimensions while maintaining
    * the structured parameter approach.
    *
    * @param options - Object containing prompt, dimensions, and other parameters
    * @returns Promise resolving to ImageGenerationResponse with generated image data
    *
    * @example
    * ```typescript
    * const response = await client.image.generateWithSize({
    *   prompt: "A panoramic landscape",
    *   width: 1792,
    *   height: 1024,
    *   model: "openai/dall-e-3",
    *   quality: "hd",
    *   appId: "my-app"
    * });
    * ```
    */
   async generateWithSize(options: {
      prompt: string;
      width: number;
      height: number;
      model?: string;
      quality?: "standard" | "hd";
      response_format?: "url" | "b64_json";
      style?: "vivid" | "natural";
      n?: number;
      seed?: number;
      user?: string;
      appId?: string;
   }): Promise<ImageGenerationResponse> {
      return this.generateImage({
         prompt: options.prompt,
         width: options.width,
         height: options.height,
         model: options.model,
         quality: options.quality,
         response_format: options.response_format,
         style: options.style,
         n: options.n,
         seed: options.seed,
         user: options.user,
         appId: options.appId,
      });
   }

   /**
    * Convenience method for high-quality image generation.
    *
    * This method automatically sets the quality to "hd" for high-definition
    * image generation while using the structured parameter approach.
    *
    * @param options - Object containing prompt and other parameters
    * @returns Promise resolving to ImageGenerationResponse with HD image data
    *
    * @example
    * ```typescript
    * const response = await client.image.generateHD({
    *   prompt: "A detailed portrait of a cat",
    *   model: "openai/dall-e-3",
    *   size: "1024x1024"
    * });
    * ```
    */
   async generateHD(options: {
      prompt: string;
      model?: string;
      size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
      response_format?: "url" | "b64_json";
      style?: "vivid" | "natural";
      n?: number;
      seed?: number;
      user?: string;
   }): Promise<ImageGenerationResponse> {
      return this.generateImage({
         prompt: options.prompt,
         quality: "hd",
         model: options.model,
         size: options.size,
         response_format: options.response_format,
         style: options.style,
         n: options.n,
         seed: options.seed,
         user: options.user,
      });
   }

   /**
    * Convenience method for image generation with base64 response format.
    *
    * This method automatically sets the response format to base64 JSON
    * for direct image data access.
    *
    * @param options - Object containing prompt and other parameters
    * @returns Promise resolving to ImageGenerationResponse with base64 image data
    *
    * @example
    * ```typescript
    * const response = await client.image.generateBase64({
    *   prompt: "A digital art piece",
    *   model: "openai/dall-e-3",
    *   size: "1024x1024",
    *   appId: "my-app"
    * });
    * ```
    */
   async generateBase64(options: {
      prompt: string;
      model?: string;
      size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
      quality?: "standard" | "hd";
      style?: "vivid" | "natural";
      n?: number;
      seed?: number;
      user?: string;
      appId?: string;
   }): Promise<ImageGenerationResponse> {
      return this.generateImage({
         prompt: options.prompt,
         response_format: "b64_json",
         model: options.model,
         size: options.size,
         quality: options.quality,
         style: options.style,
         n: options.n,
         seed: options.seed,
         user: options.user,
         appId: options.appId,
      });
   }

   /**
    * Convenience method for image generation with URL response format.
    *
    * This method automatically sets the response format to URL
    * for direct image URL access.
    *
    * @param options - Object containing prompt and other parameters
    * @returns Promise resolving to ImageGenerationResponse with image URLs
    *
    * @example
    * ```typescript
    * const response = await client.image.generateURL({
    *   prompt: "A modern office space",
    *   model: "openai/dall-e-3",
    *   size: "1024x1024"
    * });
    * ```
    */
   async generateURL(options: {
      prompt: string;
      model?: string;
      size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
      quality?: "standard" | "hd";
      style?: "vivid" | "natural";
      n?: number;
      seed?: number;
      user?: string;
   }): Promise<ImageGenerationResponse> {
      return this.generateImage({
         prompt: options.prompt,
         response_format: "url",
         model: options.model,
         size: options.size,
         quality: options.quality,
         style: options.style,
         n: options.n,
         seed: options.seed,
         user: options.user,
      });
   }

   /**
    * Generates multiple images from a single prompt.
    *
    * This method allows for batch image generation with a specified count,
    * using the structured parameter approach.
    *
    * @param options - Object containing prompt, count, and other parameters
    * @returns Promise resolving to ImageGenerationResponse with multiple images
    * @throws Error if count is not between 1 and 10
    *
    * @example
    * ```typescript
    * const response = await client.image.generateMultiple({
    *   prompt: "A fantasy castle",
    *   count: 4,
    *   model: "openai/dall-e-3",
    *   size: "1024x1024"
    * });
    * ```
    */
   async generateMultiple(options: {
      prompt: string;
      count: number;
      model?: string;
      size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
      quality?: "standard" | "hd";
      response_format?: "url" | "b64_json";
      style?: "vivid" | "natural";
      seed?: number;
      user?: string;
   }): Promise<ImageGenerationResponse> {
      if (options.count < 1 || options.count > 10) {
         throw new Error("Count must be between 1 and 10");
      }

      return this.generateImage({
         prompt: options.prompt,
         n: options.count,
         model: options.model,
         size: options.size,
         quality: options.quality,
         response_format: options.response_format,
         style: options.style,
         seed: options.seed,
         user: options.user,
      });
   }

   /**
    * Validates image generation parameters for correctness.
    *
    * This static method performs validation on image generation parameters
    * to ensure they meet the API requirements before making requests.
    *
    * @param prompt - Text prompt for image generation
    * @param width - Optional width of the image
    * @param height - Optional height of the image
    * @throws Error if parameters are invalid
    *
    * @example
    * ```typescript
    * ImageService.validateImageGenerationParams(
    *   "A beautiful landscape",
    *   1024,
    *   1024
    * );
    * ```
    */
   static validateImageGenerationParams(
      prompt: string,
      width?: number,
      height?: number
   ): void {
      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
         throw new Error("Prompt is required and cannot be empty");
      }

      if (width !== undefined && (width < 256 || width > 1792)) {
         throw new Error("Width must be between 256 and 1792");
      }

      if (height !== undefined && (height < 256 || height > 1792)) {
         throw new Error("Height must be between 256 and 1792");
      }
   }
}
