import { LunosClient } from "../src/index";

/**
 * Model Service Examples
 *
 * This file demonstrates various model discovery and information capabilities including:
 * - Getting all available models
 * - Filtering by capabilities
 * - Model information and pricing
 * - Search and categorization
 */

async function modelExamples() {
   const client = new LunosClient({
      apiKey:
         process.env.LUNOS_API_KEY ||
         "sk-694f5c2bfc72921c7fd3628d69ed2ea7d4bb6c1aadd4e608",
   });

   console.log("🤖 Model Service Examples");
   console.log("=========================\n");

   try {
      // Get all models
      console.log("1. All Available Models");
      const models = await client.models.getModels();
      console.log(`   Total models available: ${models.length}`);
      console.log(
         `   Sample models: ${models
            .slice(0, 3)
            .map((m) => m.id)
            .join(", ")}`
      );
      console.log("");

      // Get models by capability
      console.log("2. Models by Capability");

      const chatModels = await client.models.getChatModels();
      console.log(`   Chat models: ${chatModels.length}`);
      console.log(
         `   Sample chat models: ${chatModels
            .slice(0, 3)
            .map((m) => m.id)
            .join(", ")}`
      );

      const imageModels = await client.models.getImageModels();
      console.log(`   Image models: ${imageModels.length}`);
      console.log(
         `   Sample image models: ${imageModels
            .slice(0, 3)
            .map((m) => m.id)
            .join(", ")}`
      );

      const audioModels = await client.models.getAudioModels();
      console.log(`   Audio models: ${audioModels.length}`);
      console.log(
         `   Sample audio models: ${audioModels
            .slice(0, 3)
            .map((m) => m.id)
            .join(", ")}`
      );

      const embeddingModels = await client.models.getEmbeddingModels();
      console.log(`   Embedding models: ${embeddingModels.length}`);
      console.log(
         `   Sample embedding models: ${embeddingModels
            .slice(0, 3)
            .map((m) => m.id)
            .join(", ")}`
      );

      // Get specific model information
      console.log("3. Specific Model Information");
      const modelId = "deepseek/deepseek-r1-0528";
      const model = await client.models.getModelById(modelId);
      if (model) {
         console.log(`   Model: ${model.id}`);
         console.log(`   Name: ${model.name}`);
         console.log(`   Provider: ${model.provider}`);
         console.log(`   Status: ${model.status}`);
         console.log(`   Capabilities: ${model.capabilities?.join(", ")}`);
         if (model.parameters?.context) {
            console.log(`   Context length: ${model.parameters.context}`);
         }
         if (model.pricePerMillionTokens) {
            console.log(
               `   Pricing - Input: $${model.pricePerMillionTokens.input}/1M, Output: $${model.pricePerMillionTokens.output}/1M`
            );
         }
         if (model.description) {
            console.log(`   Description: ${model.description}`);
         }
      } else {
         console.log(`   Model ${modelId} not found`);
      }
      console.log("");

      // Get models by owner
      console.log("4. Models by Owner");
      const openaiModels = await client.models.getModelsByOwner("openai");
      console.log(`   OpenAI models: ${openaiModels.length}`);
      console.log(
         `   Sample OpenAI models: ${openaiModels
            .slice(0, 3)
            .map((m) => m.id)
            .join(", ")}`
      );
      console.log("");

      // Search models
      console.log("5. Model Search");
      const searchResults = await client.models.searchModels("gpt");
      console.log(`   Models containing 'gpt': ${searchResults.length}`);
      console.log(
         `   Sample results: ${searchResults
            .slice(0, 3)
            .map((m) => m.id)
            .join(", ")}`
      );

      const embeddingSearch = await client.models.searchModels("embedding");
      console.log(
         `   Models containing 'embedding': ${embeddingSearch.length}`
      );
      console.log(
         `   Sample results: ${embeddingSearch
            .slice(0, 3)
            .map((m) => m.id)
            .join(", ")}`
      );
      console.log("");

      // Check model capabilities
      console.log("6. Model Capabilities");
      const testModelId = "deepseek/deepseek-r1-0528";
      const capabilities = await client.models.getModelCapabilities(
         testModelId
      );
      console.log(`   Capabilities for ${testModelId}:`);
      for (const capability of capabilities) {
         console.log(`     - ${capability}`);
      }
      console.log("");

      // Check specific capability support
      console.log("7. Specific Capability Support");
      const supportsChat = await client.models.supportsCapability(
         testModelId,
         "chat"
      );
      const supportsImage = await client.models.supportsCapability(
         testModelId,
         "image-generation"
      );
      const supportsEmbedding = await client.models.supportsCapability(
         testModelId,
         "embeddings"
      );

      console.log(`   ${testModelId} supports:`);
      console.log(`     Chat: ${supportsChat ? "Yes" : "No"}`);
      console.log(`     Image generation: ${supportsImage ? "Yes" : "No"}`);
      console.log(`     Embeddings: ${supportsEmbedding ? "Yes" : "No"}`);
      console.log("");

      // Get model pricing
      console.log("8. Model Pricing");
      const pricing = await client.models.getModelPricing(testModelId);
      if (pricing) {
         console.log(`   Pricing for ${testModelId}:`);
         console.log(`     Input tokens: $${pricing.input}/1K tokens`);
         console.log(`     Output tokens: $${pricing.output}/1K tokens`);
      } else {
         console.log(`   No pricing information available for ${testModelId}`);
      }
      console.log("");

      // Get model context length
      console.log("9. Model Context Length");
      const contextLength = await client.models.getModelContextLength(
         testModelId
      );
      if (contextLength) {
         console.log(
            `   Context length for ${testModelId}: ${contextLength} tokens`
         );
      } else {
         console.log(
            `   No context length information available for ${testModelId}`
         );
      }
      console.log("");

      console.log("✅ Model examples completed successfully!");
   } catch (error) {
      console.error("❌ Error during model examples:", error);
      process.exit(1);
   }
}

// Run the examples
if (require.main === module) {
   modelExamples().catch(console.error);
}
