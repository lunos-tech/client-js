import { BaseRequest, BaseResponse } from "./common";

export interface ImageGenerationRequest extends BaseRequest {
   /** Text prompt for image generation */
   prompt: string;
   /** Number of images to generate */
   n?: number;
   /** Size of the generated image */
   size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
   /** Width of the image (for custom sizes) */
   width?: number;
   /** Height of the image (for custom sizes) */
   height?: number;
   /** Quality of the generated image */
   quality?: "standard" | "hd";
   /** Response format */
   response_format?: "url" | "b64_json";
   /** Style of the generated image */
   style?: "vivid" | "natural";
   /** Seed for reproducible results */
   seed?: number;
   /** User identifier */
   user?: string;
}

export interface ImageGenerationData {
   /** URL of the generated image */
   url?: string;
   /** Base64 encoded image data */
   b64_json?: string;
   /** Revised prompt if applicable */
   revised_prompt?: string;
}

export interface ImageGenerationResponse extends BaseResponse {
   /** Response object type */
   object: "list";
   /** Generated images */
   data: ImageGenerationData[];
}

export interface ImageEditRequest extends BaseRequest {
   /** Image to edit (base64 or URL) */
   image: string;
   /** Mask image (base64 or URL) */
   mask?: string;
   /** Text prompt for the edit */
   prompt: string;
   /** Number of images to generate */
   n?: number;
   /** Size of the generated image */
   size?: "256x256" | "512x512" | "1024x1024";
   /** Response format */
   response_format?: "url" | "b64_json";
   /** User identifier */
   user?: string;
}

export interface ImageVariationRequest extends BaseRequest {
   /** Base image for variation (base64 or URL) */
   image: string;
   /** Number of variations to generate */
   n?: number;
   /** Size of the generated image */
   size?: "256x256" | "512x512" | "1024x1024";
   /** Response format */
   response_format?: "url" | "b64_json";
   /** User identifier */
   user?: string;
}
