import { BaseRequest, BaseResponse } from "./common";

/**
 * Video generation parameters
 */
export interface VideoGenerationParameters {
   /** Aspect ratio of the video, currently only supports 16:9 */
   aspectRatio?: "16:9";
   /** Negative prompt to avoid certain elements in the video */
   negativePrompt?: string;
}

/**
 * Video generation request
 */
export interface VideoGenerationRequest extends BaseRequest {
   /** The model to use for video generation */
   model: string;
   /** The prompt to generate videos for */
   prompt: string;
   /** Additional parameters for video generation */
   parameters?: VideoGenerationParameters;
   /** The format of the generated video. Currently only supports mp4 */
   response_format?: "mp4";
}

/**
 * Video generation response (initial response with operation ID)
 */
export interface VideoGenerationResponse extends BaseResponse {
   /** Operation ID for tracking the video generation progress */
   id: string;
   /** Operation name for internal tracking */
   operation_name: string;
   /** Current status of the operation */
   status: "pending" | "processing" | "completed" | "failed";
}

/**
 * Video generation status response
 */
export interface VideoGenerationStatus {
   /** Operation ID */
   id: string;
   /** Current status of the operation */
   status: "pending" | "processing" | "completed" | "failed";
   /** Video URL when generation is completed */
   video_url?: string;
   /** Error message if generation failed */
   error?: string;
}

/**
 * Video generation options for convenience methods
 */
export interface VideoGenerationOptions {
   /** The prompt to generate videos for */
   prompt: string;
   /** The model to use for video generation */
   model?: string;
   /** Aspect ratio of the video */
   aspectRatio?: "16:9";
   /** Negative prompt to avoid certain elements */
   negativePrompt?: string;
   /** Response format */
   response_format?: "mp4";
   /** User identifier for tracking */
   user?: string;
   /** Application identifier */
   appId?: string;
}
