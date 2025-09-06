import { LunosClient } from "../src/client/LunosClient";

// Initialize the client
const client = new LunosClient({
   apiKey: "sk-3514b12cf9fb25266a3d94f1b96d2770a30638232759e0da",
   appId: "test",
});

/**
 * Basic video generation example
 *
 * This example demonstrates how to generate a video using the Google Veo 3.0 model
 * with a simple prompt and basic parameters.
 */
async function basicVideoGeneration() {
   console.log("=== Basic Video Generation ===");

   try {
      // Start video generation
      const response = await client.video.generateVideo({
         model: "google/veo-3.0-generate-preview",
         prompt: "A cinematic shot of a majestic lion in the savannah.",
         parameters: {
            aspectRatio: "16:9",
            negativePrompt: "cartoon, drawing, low quality",
         },
         response_format: "mp4",
         appId: "my-app",
      });

      console.log("Video generation started!");
      console.log("Operation ID:", response.id);
      console.log("Status:", response.status);

      // Check status until completion
      let status = await client.video.getVideoStatus(response.id, "my-app");

      while (status.status === "pending" || status.status === "processing") {
         console.log("Status:", status.status);
         await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
         status = await client.video.getVideoStatus(response.id, "my-app");
      }

      if (status.status === "completed") {
         console.log("Video generation completed!");
         console.log("Video URL:", status.video_url);
      } else {
         console.log("Video generation failed:", status.error);
      }
   } catch (error) {
      console.error("Error generating video:", error);
   }
}

/**
 * Convenience method example
 *
 * This example shows how to use the simplified generate method
 * for easier video generation.
 */
async function convenienceMethodExample() {
   console.log("\n=== Convenience Method Example ===");

   try {
      const response = await client.video.generate({
         prompt: "A futuristic city skyline at night with flying cars",
         model: "google/veo-3.0-generate-preview",
         aspectRatio: "16:9",
         negativePrompt: "cartoon, low quality, blurry",
         appId: "my-app",
      });

      console.log("Video generation started with convenience method!");
      console.log("Operation ID:", response.id);
   } catch (error) {
      console.error("Error generating video:", error);
   }
}

/**
 * Generate and wait example
 *
 * This example demonstrates how to generate a video and wait for completion
 * in a single method call.
 */
async function generateAndWaitExample() {
   console.log("\n=== Generate and Wait Example ===");

   try {
      const result = await client.video.generateAndWait(
         {
            prompt: "A beautiful sunset over mountains with birds flying",
            aspectRatio: "16:9",
            negativePrompt: "cartoon, animation, low quality",
         },
         10000,
         300000
      ); // Poll every 10 seconds, max wait 5 minutes

      console.log("Video generation completed!");
      console.log("Video URL:", result.video_url);
   } catch (error) {
      console.error("Error generating video:", error);
   }
}

/**
 * Widescreen video generation example
 *
 * This example shows how to generate widescreen videos using
 * the convenience method.
 */
async function widescreenVideoExample() {
   console.log("\n=== Widescreen Video Example ===");

   try {
      const response = await client.video.generateWidescreen({
         prompt: "A cinematic car chase scene through a busy city",
         negativePrompt: "cartoon, animation, low quality, blurry",
      });

      console.log("Widescreen video generation started!");
      console.log("Operation ID:", response.id);
   } catch (error) {
      console.error("Error generating widescreen video:", error);
   }
}

/**
 * MP4 video generation example
 *
 * This example demonstrates generating videos specifically in MP4 format.
 */
async function mp4VideoExample() {
   console.log("\n=== MP4 Video Example ===");

   try {
      const response = await client.video.generateMP4({
         prompt:
            "A peaceful forest scene with birds chirping and sunlight filtering through trees",
         aspectRatio: "16:9",
      });

      console.log("MP4 video generation started!");
      console.log("Operation ID:", response.id);
   } catch (error) {
      console.error("Error generating MP4 video:", error);
   }
}

/**
 * Advanced video generation with custom parameters
 *
 * This example shows how to use all available parameters
 * for fine-tuned video generation.
 */
async function advancedVideoGeneration() {
   console.log("\n=== Advanced Video Generation ===");

   try {
      const response = await client.video.generateVideo({
         model: "google/veo-3.0-generate-preview",
         prompt:
            "A dramatic storm over the ocean with lightning and waves crashing against rocks",
         parameters: {
            aspectRatio: "16:9",
            negativePrompt:
               "cartoon, drawing, low quality, blurry, static, boring",
         },
         response_format: "mp4",
         user: "user123",
         appId: "my-app",
      });

      console.log("Advanced video generation started!");
      console.log("Operation ID:", response.id);
      console.log("Operation Name:", response.operation_name);

      // Monitor progress with custom polling
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes with 10-second intervals

      while (attempts < maxAttempts) {
         const status = await client.video.getVideoStatus(
            response.id,
            "my-app"
         );
         console.log(`Attempt ${attempts + 1}: Status = ${status.status}`);

         if (status.status === "completed") {
            console.log("Video generation completed!");
            console.log("Video URL:", status.video_url);
            break;
         } else if (status.status === "failed") {
            console.log("Video generation failed:", status.error);
            break;
         }

         attempts++;
         await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      if (attempts >= maxAttempts) {
         console.log("Video generation timed out after 5 minutes");
      }
   } catch (error) {
      console.error("Error in advanced video generation:", error);
   }
}

/**
 * Error handling example
 *
 * This example demonstrates proper error handling for video generation.
 */
async function errorHandlingExample() {
   console.log("\n=== Error Handling Example ===");

   try {
      // This will fail due to invalid parameters
      await client.video.generateVideo({
         model: "", // Invalid empty model
         prompt: "", // Invalid empty prompt
         parameters: {
            aspectRatio: "4:3" as any, // Invalid aspect ratio
         },
      });
   } catch (error) {
      console.log("Caught expected error:", error.message);
   }

   try {
      // This will fail due to invalid operation ID
      await client.video.getVideoStatus("invalid-operation-id");
   } catch (error) {
      console.log("Caught expected error:", error.message);
   }
}

/**
 * Batch video generation example
 *
 * This example shows how to generate multiple videos in sequence.
 */
async function batchVideoGeneration() {
   console.log("\n=== Batch Video Generation ===");

   const prompts = [
      "A serene lake with swans swimming",
      "A bustling marketplace in an ancient city",
      "A space station orbiting a distant planet",
   ];

   const results = [];

   for (let i = 0; i < prompts.length; i++) {
      try {
         console.log(
            `Starting video ${i + 1}/${prompts.length}: ${prompts[i]}`
         );

         const response = await client.video.generate({
            prompt: prompts[i],
            aspectRatio: "16:9",
            negativePrompt: "cartoon, low quality",
         });

         results.push({
            index: i + 1,
            prompt: prompts[i],
            operationId: response.id,
            status: response.status,
         });

         console.log(
            `Video ${i + 1} started with operation ID: ${response.id}`
         );
      } catch (error) {
         console.error(`Error starting video ${i + 1}:`, error.message);
         results.push({
            index: i + 1,
            prompt: prompts[i],
            error: error.message,
         });
      }
   }

   console.log("\nBatch generation results:");
   results.forEach((result) => {
      if (result.error) {
         console.log(`Video ${result.index}: ERROR - ${result.error}`);
      } else {
         console.log(
            `Video ${result.index}: ${result.operationId} (${result.status})`
         );
      }
   });
}

/**
 * Main function to run all examples
 */
async function runAllExamples() {
   console.log("Starting Video Generation Examples...\n");

   // Run examples
   await basicVideoGeneration();
   // await convenienceMethodExample();
   // await generateAndWaitExample();
   // await widescreenVideoExample();
   // await mp4VideoExample();
   // await advancedVideoGeneration();
   // await errorHandlingExample();
   // await batchVideoGeneration();

   console.log("\nAll examples completed!");
}

// Export functions for individual testing
export {
   basicVideoGeneration,
   convenienceMethodExample,
   generateAndWaitExample,
   widescreenVideoExample,
   mp4VideoExample,
   advancedVideoGeneration,
   errorHandlingExample,
   batchVideoGeneration,
   runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
   runAllExamples().catch(console.error);
}
