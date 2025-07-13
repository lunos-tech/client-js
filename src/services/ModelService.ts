import { BaseService } from "./base/BaseService";
import { Model, ModelCapability, ModelCategory } from "../types/models";

export class ModelService extends BaseService {
   /**
    * Gets all available models
    */
   async getModels(): Promise<Model[]> {
      this.log("Getting all models");
      return this.makeRequest<Model[]>("/public/models");
   }

   /**
    * Gets a specific model by ID
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
    * Gets models by capability
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
    * Gets chat models
    */
   async getChatModels(): Promise<Model[]> {
      return this.getModelsByCapability("chat");
   }

   /**
    * Gets image generation models
    */
   async getImageModels(): Promise<Model[]> {
      return this.getModelsByCapability("image-generation");
   }

   /**
    * Gets audio generation models
    */
   async getAudioModels(): Promise<Model[]> {
      return this.getModelsByCapability("text-to-speech");
   }

   /**
    * Gets embedding models
    */
   async getEmbeddingModels(): Promise<Model[]> {
      return this.getModelsByCapability("embeddings");
   }

   /**
    * Gets transcription models
    */
   async getTranscriptionModels(): Promise<Model[]> {
      return this.getModelsByCapability("audio-transcription");
   }

   /**
    * Gets models by owner
    */
   async getModelsByOwner(owner: string): Promise<Model[]> {
      if (!owner || typeof owner !== "string") {
         throw new Error("Owner is required");
      }

      this.log("Getting models by owner", { owner });
      const models = await this.getModels();
      return models.filter((model) => model.owned_by === owner);
   }

   /**
    * Gets models by category
    */
   async getModelsByCategory(category: string): Promise<Model[]> {
      if (!category || typeof category !== "string") {
         throw new Error("Category is required");
      }

      this.log("Getting models by category", { category });
      const models = await this.getModels();
      return models.filter(
         (model) =>
            model.id.toLowerCase().includes(category.toLowerCase()) ||
            model.owned_by.toLowerCase().includes(category.toLowerCase())
      );
   }

   /**
    * Gets models grouped by category
    */
   async getModelsByCategories(): Promise<ModelCategory[]> {
      const models = await this.getModels();
      const categories: Record<string, Model[]> = {};

      for (const model of models) {
         const owner = model.owned_by;
         if (!categories[owner]) {
            categories[owner] = [];
         }
         categories[owner].push(model);
      }

      return Object.entries(categories).map(([name, models]) => ({
         name,
         description: `Models from ${name}`,
         models,
      }));
   }

   /**
    * Gets model capabilities
    */
   async getModelCapabilities(modelId: string): Promise<ModelCapability[]> {
      const model = await this.getModelById(modelId);
      if (!model) {
         throw new Error(`Model not found: ${modelId}`);
      }

      const allCapabilities = [
         { name: "chat", description: "Chat completions", supported: false },
         {
            name: "image-generation",
            description: "Image generation",
            supported: false,
         },
         {
            name: "text-to-speech",
            description: "Text to speech",
            supported: false,
         },
         {
            name: "embeddings",
            description: "Text embeddings",
            supported: false,
         },
         {
            name: "audio-transcription",
            description: "Audio transcription",
            supported: false,
         },
      ];

      return allCapabilities.map((capability) => ({
         ...capability,
         supported: model.capabilities?.includes(capability.name) || false,
      }));
   }

   /**
    * Checks if a model supports a specific capability
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
    * Gets model pricing information
    */
   async getModelPricing(
      modelId: string
   ): Promise<{ input: number; output: number } | null> {
      const model = await this.getModelById(modelId);
      return model?.pricing || null;
   }

   /**
    * Gets model context length
    */
   async getModelContextLength(modelId: string): Promise<number | null> {
      const model = await this.getModelById(modelId);
      return model?.context_length || null;
   }

   /**
    * Searches models by name or description
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
            model.owned_by.toLowerCase().includes(lowerQuery) ||
            model.description?.toLowerCase().includes(lowerQuery)
      );
   }

   /**
    * Gets the latest models (most recently created)
    */
   async getLatestModels(limit: number = 10): Promise<Model[]> {
      if (limit < 1 || limit > 100) {
         throw new Error("Limit must be between 1 and 100");
      }

      this.log("Getting latest models", { limit });
      const models = await this.getModels();
      return models.sort((a, b) => b.created - a.created).slice(0, limit);
   }

   /**
    * Validates model parameters
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
