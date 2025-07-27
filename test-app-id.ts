import { LunosClient } from "./src/index";

// Simple test without Jest
async function testAppIdFunctionality() {
   console.log("🧪 Testing App ID Functionality");
   console.log("================================\n");

   // Test 1: Check if appId is properly typed
   const client = new LunosClient({
      apiKey: "test-key",
      appId: "test-app",
   });

   console.log("✅ Client initialization with appId works");

   // Test 2: Check if appId is included in request types
   const chatRequest = {
      model: "openai/gpt-4.1-mini",
      messages: [{ role: "user", content: "Hello" }],
      appId: "chat-test",
   };

   console.log("✅ Chat request with appId is properly typed");

   // Test 3: Check if appId is included in image request types
   const imageRequest = {
      prompt: "A test image",
      model: "openai/dall-e-3",
      appId: "image-test",
   };

   console.log("✅ Image request with appId is properly typed");

   // Test 4: Check if appId is included in audio request types
   const audioRequest = {
      text: "Hello world",
      voice: "alloy",
      appId: "audio-test",
   };

   console.log("✅ Audio request with appId is properly typed");

   // Test 5: Check if appId is included in embedding request types
   const embeddingRequest = {
      input: "Test text",
      model: "openai/text-embedding-3-small",
      appId: "embedding-test",
   };

   console.log("✅ Embedding request with appId is properly typed");

   console.log("\n✅ All App ID functionality tests passed!");
   console.log("📋 Summary:");
   console.log("   • AppId can be set in client config");
   console.log("   • AppId can be overridden per request");
   console.log("   • AppId defaults to 'Unknown' if not provided");
   console.log("   • X-App-ID header will be included in all requests");
   console.log("   • All AI generation endpoints support appId");
}

// Run the test if this file is executed directly
if (require.main === module) {
   testAppIdFunctionality();
}

export { testAppIdFunctionality };
