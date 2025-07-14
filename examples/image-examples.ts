import { LunosClient } from "../src/index";

/**
 * Image Service Examples
 *
 * This file demonstrates various image generation capabilities including:
 * - Basic image generation
 * - Different sizes and qualities
 * - Various response formats
 * - Custom dimensions
 */

async function imageExamples() {
   const client = new LunosClient({
      apiKey:
         process.env.LUNOS_API_KEY ||
         "sk-694f5c2bfc72921c7fd3628d69ed2ea7d4bb6c1aadd4e608",
   });

   console.log("🎨 Image Service Examples");
   console.log("=========================\n");

   try {
      // Basic image generation
      console.log("1. Basic Image Generation");
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

      // High-quality image generation
      console.log("2. High-Quality Image Generation");
      const hdImage = await client.image.generateHD({
         prompt: "A detailed portrait of a cat in renaissance style",
         model: "openai/dall-e-3",
         size: "1024x1024",
      });
      console.log(`   HD Image generated: ${hdImage.data.length} image(s)`);
      console.log("");

      // Image with custom dimensions
      console.log("3. Custom Dimensions Image");
      const panoramicImage = await client.image.generateWithSize({
         prompt: "A panoramic landscape of mountains at sunset",
         width: 1792,
         height: 1024,
         model: "openai/dall-e-3",
         quality: "hd",
      });
      console.log(
         `   Panoramic image generated: ${panoramicImage.data.length} image(s)`
      );
      console.log("");

      // Base64 response format
      console.log("4. Base64 Response Format");
      const base64Image = await client.image.generateBase64({
         prompt: "A digital art piece with neon colors",
         model: "openai/dall-e-3",
         size: "1024x1024",
      });
      console.log(
         `   Base64 image generated: ${base64Image.data.length} image(s)`
      );
      if (base64Image.data[0]?.b64_json) {
         console.log(
            `   Base64 data length: ${base64Image.data[0].b64_json.length} characters`
         );
      }
      console.log("");

      // URL response format
      console.log("5. URL Response Format");
      const urlImage = await client.image.generateURL({
         prompt: "A modern office space with plants",
         model: "openai/dall-e-3",
         size: "1024x1024",
      });
      console.log(`   URL image generated: ${urlImage.data.length} image(s)`);
      if (urlImage.data[0]?.url) {
         console.log(`   Image URL: ${urlImage.data[0].url}`);
      }
      console.log("");

      // Different styles
      console.log("6. Different Styles");

      // Vivid style
      const vividImage = await client.image.generate({
         prompt: "A vibrant cityscape at night",
         model: "openai/dall-e-3",
         size: "1024x1024",
         style: "vivid",
      });
      console.log(
         `   Vivid style image generated: ${vividImage.data.length} image(s)`
      );

      // Natural style
      const naturalImage = await client.image.generate({
         prompt: "A peaceful forest scene",
         model: "openai/dall-e-3",
         size: "1024x1024",
         style: "natural",
      });
      console.log(
         `   Natural style image generated: ${naturalImage.data.length} image(s)`
      );
      console.log("");

      // Different sizes
      console.log("7. Different Sizes");

      const sizes = [
         "256x256",
         "512x512",
         "1024x1024",
         "1792x1024",
         "1024x1792",
      ];
      for (const size of sizes) {
         const sizeImage = await client.image.generate({
            prompt: `A simple geometric pattern in ${size} size`,
            model: "openai/dall-e-3",
            size: size as any,
         });
         console.log(
            `   ${size} image generated: ${sizeImage.data.length} image(s)`
         );
      }
      console.log("");

      console.log("✅ Image examples completed successfully!");
   } catch (error) {
      console.error("❌ Error during image examples:", error);
      process.exit(1);
   }
}

// Run the examples
if (require.main === module) {
   imageExamples().catch(console.error);
}
