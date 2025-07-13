import { BaseService } from "./base/BaseService";
import {
   ImageGenerationRequest,
   ImageGenerationResponse,
   ImageEditRequest,
   ImageVariationRequest,
} from "../types/image";
import { ValidationUtils } from "../utils/validation";

export class ImageService extends BaseService {
   /**
    * Generates an image based on a text prompt
    */
   async generateImage(
      request: ImageGenerationRequest
   ): Promise<ImageGenerationResponse> {
      ValidationUtils.validateImageGenerationRequest(request);
      this.log("Generating image", {
         prompt: request.prompt,
         model: request.model,
      });

      return this.makeRequest<ImageGenerationResponse>(
         "/v1/image/generations",
         {
            method: "POST",
            body: JSON.stringify(request),
         }
      );
   }

   /**
    * Edits an existing image based on a text prompt
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
    * Creates variations of an existing image
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
    * Convenience method for simple image generation
    */
   async generate(
      prompt: string,
      model?: string,
      options?: Partial<ImageGenerationRequest>
   ): Promise<ImageGenerationResponse> {
      return this.generateImage({
         prompt,
         model,
         ...options,
      });
   }

   /**
    * Convenience method for image generation with specific size
    */
   async generateWithSize(
      prompt: string,
      width: number,
      height: number,
      model?: string,
      options?: Partial<ImageGenerationRequest>
   ): Promise<ImageGenerationResponse> {
      return this.generateImage({
         prompt,
         width,
         height,
         model,
         ...options,
      });
   }

   /**
    * Convenience method for high-quality image generation
    */
   async generateHD(
      prompt: string,
      model?: string,
      options?: Partial<ImageGenerationRequest>
   ): Promise<ImageGenerationResponse> {
      return this.generateImage({
         prompt,
         quality: "hd",
         model,
         ...options,
      });
   }

   /**
    * Convenience method for image generation with base64 response
    */
   async generateBase64(
      prompt: string,
      model?: string,
      options?: Partial<ImageGenerationRequest>
   ): Promise<ImageGenerationResponse> {
      return this.generateImage({
         prompt,
         response_format: "b64_json",
         model,
         ...options,
      });
   }

   /**
    * Convenience method for image generation with URL response
    */
   async generateURL(
      prompt: string,
      model?: string,
      options?: Partial<ImageGenerationRequest>
   ): Promise<ImageGenerationResponse> {
      return this.generateImage({
         prompt,
         response_format: "url",
         model,
         ...options,
      });
   }

   /**
    * Generates multiple images from a single prompt
    */
   async generateMultiple(
      prompt: string,
      count: number,
      model?: string,
      options?: Partial<ImageGenerationRequest>
   ): Promise<ImageGenerationResponse> {
      if (count < 1 || count > 10) {
         throw new Error("Count must be between 1 and 10");
      }

      return this.generateImage({
         prompt,
         n: count,
         model,
         ...options,
      });
   }

   /**
    * Validates image generation parameters
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
