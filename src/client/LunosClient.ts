import { LunosConfig } from "./config/ClientConfig";
import { mergeConfig } from "./config/DefaultConfig";
import { ChatService } from "../services/ChatService";
import { ImageService } from "../services/ImageService";
import { AudioService } from "../services/AudioService";
import { EmbeddingService } from "../services/EmbeddingService";
import { ModelService } from "../services/ModelService";
import { VideoService } from "../services/VideoService";
import { ValidationUtils } from "../utils/validation";

export class LunosClient {
   private config: LunosConfig;
   private chatService: ChatService;
   private imageService: ImageService;
   private audioService: AudioService;
   private embeddingService: EmbeddingService;
   private modelService: ModelService;
   private videoService: VideoService;

   constructor(config: Partial<LunosConfig> = {}) {
      this.config = mergeConfig(config);
      this.validateConfig();
      this.initializeServices();
   }

   /**
    * Validates the client configuration
    */
   private validateConfig(): void {
      ValidationUtils.validateApiKey(this.config.apiKey);
      ValidationUtils.validateBaseUrl(this.config.baseUrl);
      ValidationUtils.validateTimeout(this.config.timeout);
      ValidationUtils.validateRetryConfig(
         this.config.retries,
         this.config.retryDelay
      );
      ValidationUtils.validateFallbackModel(this.config.fallback_model);
   }

   /**
    * Initializes all services
    */
   private initializeServices(): void {
      this.chatService = new ChatService(this.config);
      this.imageService = new ImageService(this.config);
      this.audioService = new AudioService(this.config);
      this.embeddingService = new EmbeddingService(this.config);
      this.modelService = new ModelService(this.config);
      this.videoService = new VideoService(this.config);
   }

   /**
    * Gets the chat service
    */
   get chat(): ChatService {
      return this.chatService;
   }

   /**
    * Gets the image service
    */
   get image(): ImageService {
      return this.imageService;
   }

   /**
    * Gets the audio service
    */
   get audio(): AudioService {
      return this.audioService;
   }

   /**
    * Gets the embedding service
    */
   get embedding(): EmbeddingService {
      return this.embeddingService;
   }

   /**
    * Gets the model service
    */
   get models(): ModelService {
      return this.modelService;
   }

   /**
    * Gets the video service
    */
   get video(): VideoService {
      return this.videoService;
   }

   /**
    * Gets the current configuration
    */
   getConfig(): LunosConfig {
      return { ...this.config };
   }

   /**
    * Updates the client configuration
    */
   updateConfig(newConfig: Partial<LunosConfig>): void {
      this.config = mergeConfig({ ...this.config, ...newConfig });
      this.validateConfig();
      this.initializeServices();
   }

   /**
    * Gets API usage information
    */
   async getUsage(): Promise<any> {
      return this.chatService.getUsage();
   }

   /**
    * Gets account information
    */
   async getAccount(): Promise<any> {
      return this.chatService.getAccount();
   }

   /**
    * Creates a new client instance with updated configuration
    */
   withConfig(newConfig: Partial<LunosConfig>): LunosClient {
      return new LunosClient({ ...this.config, ...newConfig });
   }

   /**
    * Creates a new client instance with a different API key
    */
   withApiKey(apiKey: string): LunosClient {
      return new LunosClient({ ...this.config, apiKey });
   }

   /**
    * Creates a new client instance with a different base URL
    */
   withBaseUrl(baseUrl: string): LunosClient {
      return new LunosClient({ ...this.config, baseUrl });
   }

   /**
    * Creates a new client instance with debug mode enabled
    */
   withDebug(): LunosClient {
      return new LunosClient({ ...this.config, debug: true });
   }

   /**
    * Creates a new client instance with custom timeout
    */
   withTimeout(timeout: number): LunosClient {
      return new LunosClient({ ...this.config, timeout });
   }

   /**
    * Creates a new client instance with custom retry configuration
    */
   withRetryConfig(retries: number, retryDelay: number): LunosClient {
      return new LunosClient({ ...this.config, retries, retryDelay });
   }

   /**
    * Creates a new client instance with fallback model configuration
    */
   withFallbackModel(fallbackModel: string): LunosClient {
      return new LunosClient({ ...this.config, fallback_model: fallbackModel });
   }

   /**
    * Creates a new client instance with custom headers
    */
   withHeaders(headers: Record<string, string>): LunosClient {
      return new LunosClient({
         ...this.config,
         headers: { ...this.config.headers, ...headers },
      });
   }

   /**
    * Creates a new client instance with custom fetch implementation
    */
   withFetch(fetchImpl: typeof fetch): LunosClient {
      return new LunosClient({ ...this.config, fetch: fetchImpl });
   }

   /**
    * Validates that the client is properly configured
    */
   validate(): void {
      this.validateConfig();
   }

   /**
    * Gets a string representation of the client
    */
   toString(): string {
      return `LunosClient(baseUrl: ${this.config.baseUrl}, debug: ${this.config.debug})`;
   }
}
