import { LunosClient } from "../src/index";

/**
 * Chat Service Examples
 *
 * This file demonstrates various chat completion capabilities including:
 * - Basic chat completions
 * - Streaming responses
 * - Fallback model handling
 * - Different conversation patterns
 */

async function chatExamples() {
   const client = new LunosClient({
      apiKey:
         process.env.LUNOS_API_KEY ||
         "sk-694f5c2bfc72921c7fd3628d69ed2ea7d4bb6c1aadd4e608",
   });

   console.log("🚀 Chat Service Examples");
   console.log("========================\n");

   try {
      // Basic chat completion
      console.log("1. Basic Chat Completion");
      const chatResponse = await client.chat.createCompletion({
         model: "openai/gpt-4.1-mini",
         messages: [
            { role: "user", content: "Hello! Can you tell me a short joke?" },
         ],
         max_tokens: 100,
      });
      console.log(`   Response: ${chatResponse.choices[0].message.content}\n`);

      // Streaming chat with callback
      console.log("2. Streaming Chat with Callback");
      let streamedResponse = "";
      const stream = await client.chat.createCompletionWithStream(
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
      console.log("\n");

      // Chat completion with fallback model
      console.log("3. Chat Completion with Fallback Model");
      try {
         const responseWithFallback = await client.chat.createCompletion({
            model: "openai/gpt-4.1", // Primary model
            fallback_model: "openai/gpt-4.1-mini", // Fallback model
            messages: [
               {
                  role: "user",
                  content: "Explain quantum computing in simple terms.",
               },
            ],
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
      console.log("\n4. Client with Global Fallback Model");
      const clientWithFallback = client.withFallbackModel(
         "openai/gpt-4.1-mini"
      );
      try {
         const responseWithGlobalFallback =
            await clientWithFallback.chat.createCompletion({
               model: "openai/gpt-4.1", // Primary model
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

      // Convenience methods
      console.log("\n5. Convenience Methods");

      // Simple chat with structured parameters
      const simpleChat = await client.chat.chat({
         messages: [{ role: "user", content: "What is TypeScript?" }],
         model: "openai/gpt-4.1-mini",
         max_tokens: 150,
         temperature: 0.7,
      });
      console.log(
         "   Simple chat:",
         simpleChat.choices[0].message.content.substring(0, 80) + "..."
      );

      // Chat with system and user messages
      const systemChat = await client.chat.chatWithSystem({
         systemMessage: "You are a helpful coding assistant.",
         userMessage: "Write a function to calculate fibonacci numbers",
         model: "openai/gpt-4.1-mini",
         max_tokens: 300,
      });
      console.log(
         "   System chat:",
         systemChat.choices[0].message.content.substring(0, 80) + "..."
      );

      // Multi-turn conversation
      const conversation = await client.chat.createConversation({
         messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Hello!" },
            {
               role: "assistant",
               content: "Hi there! How can I help you today?",
            },
            { role: "user", content: "What's the weather like?" },
         ],
         model: "openai/gpt-4.1-mini",
      });
      console.log(
         "   Conversation:",
         conversation.choices[0].message.content.substring(0, 80) + "..."
      );

      console.log("\n✅ Chat examples completed successfully!");
   } catch (error) {
      console.error("❌ Error during chat examples:", error);
      process.exit(1);
   }
}

// Run the examples
if (require.main === module) {
   chatExamples().catch(console.error);
}
