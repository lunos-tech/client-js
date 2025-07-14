import { BaseService } from "./base/BaseService";
import { Model } from "../types/models";

/**
 * Service for handling model information and discovery operations.
 * Provides methods to retrieve available models, filter by capabilities,
 * and get detailed information about model specifications and pricing.
 */
export class ModelService extends BaseService {
   /**
    * Gets all available models from the Lunos AI API.
    *
    * This method retrieves the complete list of available models,
    * including their capabilities, pricing, and specifications.
    *
    * @returns Promise resolving to array of Model objects
    * @throws Error if API call fails
    *
    * @example
    * ```typescript
    * const models = await client.models.getModels();
    * console.log(`Available models: ${models.length}`);
    * ```
    */
   async getModels(): Promise<Model[]> {
      this.log("Getting all models");
      return this.makeRequest<Model[]>("/public/models");
   }

   /**
    * Gets a specific model by its unique identifier.
    *
    * This method searches through all available models to find
    * one with the specified ID and returns its details.
    *
    * @param id - Unique identifier of the model to retrieve
    * @returns Promise resolving to Model object or null if not found
    * @throws Error if ID is not provided
    *
    * @example
    * ```typescript
    * const model = await client.models.getModelById("openai/gpt-4.1-mini");
    * if (model) {
    *   console.log("Model found:", model.id);
    * }
    * ```
    */
   async getModelById(id: string): Promise<Model | null> {
      if (!id || typeof id !== "string") {
         throw new Error("Model ID is required");
      }

      this.log("Getting model by ID", { id });
      const models = await this.getModels();
      return models.find((model) => model.id === id) || null;
   }

   /**
    * Gets models that support a specific capability.
    *
    * This method filters all available models to return only those
    * that support the specified capability (e.g., "chat", "image-generation").
    *
    * @param capability - Capability to filter by (e.g., "chat", "embeddings")
    * @returns Promise resolving to array of Model objects with the specified capability
    * @throws Error if capability is not provided
    *
    * @example
    * ```typescript
    * const chatModels = await client.models.getModelsByCapability("chat");
    * console.log(`Chat models available: ${chatModels.length}`);
    * ```
    */
   async getModelsByCapability(capability: string): Promise<Model[]> {
      if (!capability || typeof capability !== "string") {
         throw new Error("Capability is required");
      }

      this.log("Getting models by capability", { capability });
      const models = await this.getModels();
      return models.filter((model) => model.capabilities?.includes(capability));
   }

   /**
    * Gets all models that support chat completions.
    *
    * This convenience method returns models that can be used for
    * conversational AI tasks and text generation.
    *
    * @returns Promise resolving to array of chat-capable Model objects
    *
    * @example
    * ```typescript
    * const chatModels = await client.models.getChatModels();
    * console.log("Available chat models:", chatModels.map(m => m.id));
    * ```
    */
   async getChatModels(): Promise<Model[]> {
      return this.getModelsByCapability("text-generation");
   }

   /**
    * Gets all models that support image generation.
    *
    * This convenience method returns models that can be used for
    * creating images from text prompts.
    *
    * @returns Promise resolving to array of image-generation-capable Model objects
    *
    * @example
    * ```typescript
    * const imageModels = await client.models.getImageModels();
    * console.log("Available image models:", imageModels.map(m => m.id));
    * ```
    */
   async getImageModels(): Promise<Model[]> {
      return this.getModelsByCapability("image-generation");
   }

   /**
    * Gets all models that support text-to-speech generation.
    *
    * This convenience method returns models that can be used for
    * converting text to spoken audio.
    *
    * @returns Promise resolving to array of text-to-speech-capable Model objects
    *
    * @example
    * ```typescript
    * const audioModels = await client.models.getAudioModels();
    * console.log("Available audio models:", audioModels.map(m => m.id));
    * ```
    */
   async getAudioModels(): Promise<Model[]> {
      return this.getModelsByCapability("speech-generation");
   }

   /**
    * Gets all models that support text embeddings.
    *
    * This convenience method returns models that can be used for
    * creating vector representations of text.
    *
    * @returns Promise resolving to array of embedding-capable Model objects
    *
    * @example
    * ```typescript
    * const embeddingModels = await client.models.getEmbeddingModels();
    * console.log("Available embedding models:", embeddingModels.map(m => m.id));
    * ```
    */
   async getEmbeddingModels(): Promise<Model[]> {
      return this.getModelsByCapability("text-embedding");
   }

   /**
    * Gets all models that support audio transcription.
    *
    * This convenience method returns models that can be used for
    * converting speech to text.
    *
    * @returns Promise resolving to array of transcription-capable Model objects
    *
    * @example
    * ```typescript
    * const transcriptionModels = await client.models.getTranscriptionModels();
    * console.log("Available transcription models:", transcriptionModels.map(m => m.id));
    * ```
    */
   async getTranscriptionModels(): Promise<Model[]> {
      return this.getModelsByCapability("audio-transcription");
   }

   /**
    * Gets models by their owner/organization.
    *
    * This method filters models by the organization or company that
    * owns them (e.g., "openai", "anthropic").
    *
    * @param owner - Owner/organization name to filter by
    * @returns Promise resolving to array of Model objects from the specified owner
    * @throws Error if owner is not provided
    *
    * @example
    * ```typescript
    * const openaiModels = await client.models.getModelsByOwner("openai");
    * console.log(`OpenAI models: ${openaiModels.length}`);
    * ```
    */
   async getModelsByOwner(owner: string): Promise<Model[]> {
      if (!owner || typeof owner !== "string") {
         throw new Error("Owner is required");
      }

      this.log("Getting models by owner", { owner });
      const models = await this.getModels();
      return models.filter((model) => model.provider === owner);
   }

   /**
    * Gets detailed capability information for a specific model.
    *
    * This method returns a list of all capabilities supported by the specified model.
    *
    * @param modelId - Unique identifier of the model to check
    * @returns Promise resolving to array of capability names
    * @throws Error if model is not found
    */
   async getModelCapabilities(modelId: string): Promise<string[]> {
      const model = await this.getModelById(modelId);
      if (!model) {
         throw new Error(`Model not found: ${modelId}`);
      }
      return model.capabilities || [];
   }

   /**
    * Checks if a specific model supports a given capability.
    *
    * This method provides a simple boolean check for whether a model
    * supports a particular capability without returning detailed information.
    *
    * @param modelId - Unique identifier of the model to check
    * @param capability - Capability to check for (e.g., "chat", "embeddings")
    * @returns Promise resolving to boolean indicating capability support
    *
    * @example
    * ```typescript
    * const supportsChat = await client.models.supportsCapability(
    *   "openai/gpt-4.1-mini",
    *   "chat"
    * );
    * console.log("Supports chat:", supportsChat);
    * ```
    */
   async supportsCapability(
      modelId: string,
      capability: string
   ): Promise<boolean> {
      const model = await this.getModelById(modelId);
      if (!model) {
         return false;
      }

      return model.capabilities?.includes(capability) || false;
   }

   /**
    * Gets pricing information for a specific model.
    *
    * This method returns the input and output token pricing
    * for the specified model, useful for cost estimation.
    *
    * @param modelId - Unique identifier of the model to get pricing for
    * @returns Promise resolving to pricing object or null if not available
    *
    * @example
    * ```typescript
    * const pricing = await client.models.getModelPricing("openai/gpt-4.1-mini");
    * if (pricing) {
    *   console.log(`Input: $${pricing.input}/1K tokens`);
    *   console.log(`Output: $${pricing.output}/1K tokens`);
    * }
    * ```
    */
   async getModelPricing(
      modelId: string
   ): Promise<{ input: number; output: number } | null> {
      const model = await this.getModelById(modelId);
      return model?.pricePerMillionTokens || null;
   }

   /**
    * Gets the context length (maximum tokens) for a specific model.
    *
    * This method returns the maximum number of tokens that can be
    * processed in a single request for the specified model.
    *
    * @param modelId - Unique identifier of the model to get context length for
    * @returns Promise resolving to context length number or null if not available
    *
    * @example
    * ```typescript
    * const contextLength = await client.models.getModelContextLength("openai/gpt-4.1-mini");
    * if (contextLength) {
    *   console.log(`Context length: ${contextLength} tokens`);
    * }
    * ```
    */
   async getModelContextLength(modelId: string): Promise<number | null> {
      const model = await this.getModelById(modelId);
      return model?.parameters.context || null;
   }

   /**
    * Searches models by name, owner, or description.
    *
    * This method performs a case-insensitive search across model IDs,
    * owner names, and descriptions to find matching models.
    *
    * @param query - Search query string to match against model information
    * @returns Promise resolving to array of Model objects matching the query
    * @throws Error if query is not provided
    *
    * @example
    * ```typescript
    * const searchResults = await client.models.searchModels("gpt-4");
    * console.log(`Found ${searchResults.length} models matching "gpt-4"`);
    * ```
    */
   async searchModels(query: string): Promise<Model[]> {
      if (!query || typeof query !== "string") {
         throw new Error("Search query is required");
      }

      this.log("Searching models", { query });
      const models = await this.getModels();
      const lowerQuery = query.toLowerCase();

      return models.filter(
         (model) =>
            model.id.toLowerCase().includes(lowerQuery) ||
            model.provider.toLowerCase().includes(lowerQuery) ||
            model.description?.toLowerCase().includes(lowerQuery)
      );
   }

   /**
    * Validates model parameters for correctness.
    *
    * This static method performs validation on model parameters
    * to ensure they meet the API requirements before making requests.
    *
    * @param modelId - Model identifier to validate
    * @throws Error if modelId is invalid
    *
    * @example
    * ```typescript
    * ModelService.validateModelParams("openai/gpt-4.1-mini");
    * ```
    */
   static validateModelParams(modelId: string): void {
      if (!modelId || typeof modelId !== "string") {
         throw new Error("Model ID is required");
      }

      if (modelId.trim().length === 0) {
         throw new Error("Model ID cannot be empty");
      }
   }
}
