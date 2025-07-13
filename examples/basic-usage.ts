import { LunosClient } from "../src/index";

async function main() {
   // Initialize the client
   const client = new LunosClient({
      apiKey:
         process.env.LUNOS_API_KEY ||
         "sk-694f5c2bfc72921c7fd3628d69ed2ea7d4bb6c1aadd4e608",
      // debug: true,
   });

   try {
      console.log("🚀 Lunos AI Client Library Demo");
      console.log("================================\n");

      // Chat completion
      console.log("2. Chat Completion");
      const chatResponse = await client.chat.createCompletion({
         model: "openai/gpt-4.1-mini",
         messages: [
            { role: "user", content: "Hello! Can you tell me a short joke?" },
         ],
         max_tokens: 100,
      });
      console.log(`   Response: ${chatResponse.choices[0].message.content}\n`);

      // Streaming chat with callback
      console.log("3. Streaming Chat with Callback");
      let streamedResponse = "";
      const stream1 = await client.chat.createCompletionWithStream(
         {
            model: "openai/gpt-4.1-mini",
            messages: [
               {
                  role: "user",
                  content: "Write a haiku about programming.",
               },
            ],
         },
         (chunk) => {
            streamedResponse += chunk;
            process.stdout.write(chunk);
         }
      );

      // Chat completion with streaming
      console.log("\n📝 Chat completion with streaming:");
      let fullResponse = "";
      const stream = await client.chat.createCompletionWithStream(
         {
            model: "openai/gpt-4",
            messages: [
               { role: "user", content: "Write a short poem about AI." },
            ],
            temperature: 0.7,
            max_tokens: 200,
         },
         (chunk) => {
            fullResponse += chunk;
            process.stdout.write(chunk);
         }
      );
      console.log("\n✅ Streaming completed!");

      // Chat completion with fallback model
      console.log("\n🔄 Chat completion with fallback model:");
      try {
         const responseWithFallback = await client.chat.createCompletion({
            model: "openai/gpt-4-turbo", // Primary model
            fallback_model: "openai/gpt-3.5-turbo", // Fallback model
            messages: [
               {
                  role: "user",
                  content: "Explain quantum computing in simple terms.",
               },
            ],
            temperature: 0.5,
            max_tokens: 300,
         });
         console.log(
            "✅ Response with fallback:",
            responseWithFallback.choices[0].message.content.substring(0, 100) +
               "..."
         );
      } catch (error) {
         console.error("❌ Error with fallback:", error);
      }

      // Client with global fallback model configuration
      console.log("\n⚙️ Client with global fallback model:");
      const clientWithFallback = client.withFallbackModel(
         "openai/gpt-3.5-turbo"
      );
      try {
         const responseWithGlobalFallback =
            await clientWithFallback.chat.createCompletion({
               model: "openai/gpt-4-turbo", // Primary model
               messages: [
                  { role: "user", content: "What is machine learning?" },
               ],
               temperature: 0.3,
               max_tokens: 200,
            });
         console.log(
            "✅ Response with global fallback:",
            responseWithGlobalFallback.choices[0].message.content.substring(
               0,
               100
            ) + "..."
         );
      } catch (error) {
         console.error("❌ Error with global fallback:", error);
      }

      // Image generation
      // console.log("4. Image Generation");
      // const imageResponse = await client.image.generate(
      //    "A cute robot playing with a cat",
      //    "openai/dall-e-3"
      // );
      // console.log(`   Generated ${imageResponse.data.length} image(s)`);
      // if (imageResponse.data[0]?.url) {
      //    console.log(`   Image URL: ${imageResponse.data[0].url}`);
      // }
      // console.log("");

      // // Audio generation
      // console.log("5. Audio Generation");
      // const audioResponse = await client.audio.textToSpeech(
      //    "Hello from Lunos AI! This is a test of text to speech.",
      //    "alloy",
      //    "openai/tts-1"
      // );
      // console.log(`   Generated audio: ${audioResponse.filename}`);
      // console.log(`   Content type: ${audioResponse.contentType}`);
      // console.log("");

      // // Embeddings
      // console.log("6. Text Embeddings");
      // const embedding = await client.embedding.embedText(
      //    "This is a sample text for embedding.",
      //    "openai/text-embedding-3-small"
      // );
      // console.log(`   Embedding dimensions: ${embedding.length}`);
      // console.log(
      //    `   First 5 values: [${embedding.slice(0, 5).join(", ")}...]`
      // );
      // console.log("");

      // // Model information
      // console.log("7. Model Information");
      // const models = await client.models.getModels();
      // console.log(`   Total models available: ${models.length}`);

      // const chatModels = await client.models.getChatModels();
      // console.log(`   Chat models: ${chatModels.length}`);

      // const imageModels = await client.models.getImageModels();
      // console.log(`   Image models: ${imageModels.length}`);
      // console.log("");

      // // Usage information
      // console.log("8. Usage Information");
      // try {
      //    const usage = await client.getUsage();
      //    console.log("   Usage data retrieved successfully");
      // } catch (error) {
      //    console.log("   Usage endpoint not available");
      // }

      console.log("\n✅ Demo completed successfully!");
   } catch (error) {
      console.error("❌ Error during demo:", error);
      process.exit(1);
   }
}

// Run the demo
if (require.main === module) {
   main().catch(console.error);
}
