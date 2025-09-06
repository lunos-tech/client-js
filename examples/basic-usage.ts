import { LunosClient } from "../src/index";

/**
 * Basic Usage Overview
 *
 * This file provides a simple overview of the Lunos AI client library.
 * For detailed examples of each service, see the individual example files:
 * - chat-examples.ts: Chat completion and streaming examples
 * - image-examples.ts: Image generation examples
 * - audio-examples.ts: Text-to-speech and transcription examples
 * - embedding-examples.ts: Text embedding and similarity examples
 * - model-examples.ts: Model discovery and information examples
 * - video-examples.ts: Video generation examples
 */

async function basicUsage() {
   // Initialize the client
   const client = new LunosClient({
      apiKey:
         process.env.LUNOS_API_KEY ||
         "sk-694f5c2bfc72921c7fd3628d69ed2ea7d4bb6c1aadd4e608",
   });

   console.log("🚀 Lunos AI Client Library - Basic Usage");
   console.log("========================================\n");

   try {
      // Quick overview of each service
      console.log("📋 Available Services:");
      console.log("   • Chat Service: Text generation and conversations");
      console.log("   • Image Service: Image generation from text prompts");
      console.log("   • Audio Service: Text-to-speech and transcription");
      console.log("   • Embedding Service: Text vectorization and similarity");
      console.log("   • Model Service: Model discovery and information");
      console.log("   • Video Service: Video generation from text prompts");
      console.log("");

      // Simple chat example
      console.log("💬 Quick Chat Example:");
      const chatResponse = await client.chat.createCompletion({
         model: "openai/gpt-4.1-mini",
         messages: [
            { role: "user", content: "Hello! Can you tell me a short joke?" },
         ],
         max_tokens: 100,
      });
      console.log(`   Response: ${chatResponse.choices[0].message.content}\n`);

      // Simple image example
      console.log("🎨 Quick Image Example:");
      const imageResponse = await client.image.generate({
         prompt: "A cute robot playing with a cat",
         model: "openai/dall-e-3",
         size: "1024x1024",
         quality: "hd",
      });
      console.log(`   Generated ${imageResponse.data.length} image(s)`);
      if (imageResponse.data[0]?.url) {
         console.log(`   Image URL: ${imageResponse.data[0].url}`);
      }
      console.log("");

      // Simple audio example
      console.log("🎵 Quick Audio Example:");
      const audioResponse = await client.audio.textToSpeech({
         text: "Hello from Lunos AI! This is a test of text to speech.",
         voice: "alloy",
         model: "openai/tts",
         response_format: "mp3",
         speed: 1.0,
      });
      console.log(`   Generated audio: ${audioResponse.filename}`);
      console.log(`   Content type: ${audioResponse.contentType}`);
      console.log("");

      // Simple embedding example
      console.log("🔢 Quick Embedding Example:");
      const embedding = await client.embedding.embedText(
         "This is a sample text for embedding.",
         "openai/text-embedding-3-small"
      );
      console.log(`   Embedding dimensions: ${embedding.length}`);
      console.log(
         `   First 5 values: [${embedding.slice(0, 5).join(", ")}...]`
      );
      console.log("");

      // Simple model information
      console.log("🤖 Quick Model Information:");
      const models = await client.models.getModels();
      console.log(`   Total models available: ${models.length}`);

      const chatModels = await client.models.getChatModels();
      console.log(`   Chat models: ${chatModels.length}`);

      const imageModels = await client.models.getImageModels();
      console.log(`   Image models: ${imageModels.length}`);
      console.log("");

      // Simple video example
      console.log("🎬 Quick Video Example:");
      try {
         const videoResponse = await client.video.generate({
            prompt: "A beautiful sunset over mountains",
            model: "google/veo-3.0-generate-preview",
            aspectRatio: "16:9",
            negativePrompt: "cartoon, low quality",
         });
         console.log(
            `   Video generation started with operation ID: ${videoResponse.id}`
         );
         console.log(`   Status: ${videoResponse.status}`);
      } catch (error) {
         console.log(`   Note: Video generation requires specific API access`);
      }
      console.log("");

      console.log("✅ Basic usage completed successfully!");
      console.log("\n📚 For detailed examples, run:");
      console.log("   npm run example:chat     # Chat examples");
      console.log("   npm run example:image    # Image examples");
      console.log("   npm run example:audio    # Audio examples");
      console.log("   npm run example:embedding # Embedding examples");
      console.log("   npm run example:model    # Model examples");
      console.log("   npm run example:video    # Video examples");
   } catch (error) {
      console.error("❌ Error during basic usage:", error);
      process.exit(1);
   }
}

// Run the basic usage
if (require.main === module) {
   basicUsage().catch(console.error);
}
