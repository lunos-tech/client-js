// Main client
export { LunosClient } from "./client/LunosClient";

// Services
export { ChatService } from "./services/ChatService";
export { ImageService } from "./services/ImageService";
export { AudioService } from "./services/AudioService";
export { EmbeddingService } from "./services/EmbeddingService";
export { ModelService } from "./services/ModelService";
export { VideoService } from "./services/VideoService";

// Configuration
export type { LunosConfig, RequestOptions } from "./client/config/ClientConfig";
export { DEFAULT_CONFIG, mergeConfig } from "./client/config/DefaultConfig";

// Types
export type {
   ChatMessage,
   ChatCompletionRequest,
   ChatCompletionResponse,
   ChatCompletionChunk,
   ChatRole,
} from "./types/chat";

export type {
   ImageGenerationRequest,
   ImageGenerationResponse,
   ImageEditRequest,
   ImageVariationRequest,
   ImageGenerationData,
} from "./types/image";

export type {
   AudioGenerationRequest,
   AudioGenerationResponse,
   AudioTranscriptionRequest,
   AudioTranscriptionResponse,
} from "./types/audio";

export type {
   VideoGenerationRequest,
   VideoGenerationResponse,
   VideoGenerationStatus,
   VideoGenerationParameters,
   VideoGenerationOptions,
} from "./types/video";

export type {
   EmbeddingRequest,
   EmbeddingResponse,
   EmbeddingData,
} from "./types/embedding";

export type { Model } from "./types/models";

export type {
   BaseRequest,
   BaseResponse,
   Usage,
   StreamChunk,
   StreamEnd,
   StreamResponse,
   RetryConfig,
} from "./types/common";

// Errors
export {
   LunosError,
   APIError,
   ValidationError,
   AuthenticationError,
   RateLimitError,
   NetworkError,
} from "./client/errors/LunosError";

// Utils
export { StreamProcessor } from "./utils/streaming";
export { FileUtils } from "./utils/file";
export { ValidationUtils } from "./utils/validation";

// Base service for extensibility
export { BaseService } from "./services/base/BaseService";
