import { LunosClient } from "../src/index";

/**
 * Embedding Service Examples
 *
 * This file demonstrates various text embedding capabilities including:
 * - Single text embedding
 * - Multiple text embedding
 * - Different encoding formats
 * - Custom dimensions
 * - Similarity calculations
 */

async function embeddingExamples() {
   const client = new LunosClient({
      apiKey:
         process.env.LUNOS_API_KEY ||
         "sk-694f5c2bfc72921c7fd3628d69ed2ea7d4bb6c1aadd4e608",
   });

   console.log("🔢 Embedding Service Examples");
   console.log("=============================\n");

   try {
      // Basic text embedding
      console.log("1. Basic Text Embedding");
      const embedding = await client.embedding.embedText(
         "This is a sample text for embedding.",
         "openai/text-embedding-3-small"
      );
      console.log(`   Embedding dimensions: ${embedding.length}`);
      console.log(
         `   First 5 values: [${embedding.slice(0, 5).join(", ")}...]`
      );
      console.log("");

      // Multiple text embedding
      console.log("2. Multiple Text Embedding");
      const texts = [
         "The quick brown fox jumps over the lazy dog.",
         "A journey of a thousand miles begins with a single step.",
         "All that glitters is not gold.",
         "Actions speak louder than words.",
      ];

      const embeddings = await client.embedding.embedMultiple(
         texts,
         "openai/text-embedding-3-small"
      );
      console.log(`   Generated ${embeddings.length} embeddings`);
      console.log(
         `   Each embedding has ${embeddings[0]?.length || 0} dimensions`
      );
      console.log("");

      // Structured embedding with options
      console.log("3. Structured Embedding with Options");
      const structuredEmbedding = await client.embedding.embed({
         input: "This is a structured embedding example.",
         model: "openai/text-embedding-3-small",
         encoding_format: "float",
         dimensions: 1536,
      });
      console.log(
         `   Structured embedding: ${structuredEmbedding.data.length} embeddings`
      );
      console.log(`   Model used: ${structuredEmbedding.model}`);
      console.log("");

      // Base64 encoding format
      console.log("4. Base64 Encoding Format");
      const base64Embedding = await client.embedding.embedBase64({
         input: "Text for base64 embedding",
         model: "openai/text-embedding-3-small",
         dimensions: 1536,
      });
      console.log(
         `   Base64 embedding: ${base64Embedding.data.length} embeddings`
      );
      console.log(
         `   Encoding format: ${
            base64Embedding.data[0]?.embedding ? "base64" : "float"
         }`
      );
      console.log("");

      // Float encoding format
      console.log("5. Float Encoding Format");
      const floatEmbedding = await client.embedding.embedFloat({
         input: "Text for float embedding",
         model: "openai/text-embedding-3-small",
         dimensions: 1536,
      });
      console.log(
         `   Float embedding: ${floatEmbedding.data.length} embeddings`
      );
      console.log(
         `   First value type: ${typeof floatEmbedding.data[0]?.embedding[0]}`
      );
      console.log("");

      // Custom dimensions
      console.log("6. Custom Dimensions");
      const customEmbedding = await client.embedding.embedWithDimensions({
         input: "Text for custom dimension embedding",
         dimensions: 1024,
         model: "openai/text-embedding-3-small",
      });
      console.log(
         `   Custom dimension embedding: ${customEmbedding.data.length} embeddings`
      );
      console.log(
         `   Dimensions: ${customEmbedding.data[0]?.embedding.length}`
      );
      console.log("");

      // Similarity calculations
      console.log("7. Similarity Calculations");

      // Generate embeddings for similarity testing
      const similarityTexts = [
         "The cat sat on the mat.",
         "A cat is sitting on a mat.",
         "The weather is sunny today.",
         "It's a beautiful sunny day.",
      ];

      const similarityEmbeddings = await client.embedding.embedMultiple(
         similarityTexts,
         "openai/text-embedding-3-small"
      );

      // Calculate cosine similarity between similar and different texts
      const similarPair = EmbeddingService.cosineSimilarity(
         similarityEmbeddings[0], // "The cat sat on the mat."
         similarityEmbeddings[1] // "A cat is sitting on a mat."
      );

      const differentPair = EmbeddingService.cosineSimilarity(
         similarityEmbeddings[0], // "The cat sat on the mat."
         similarityEmbeddings[2] // "The weather is sunny today."
      );

      console.log(`   Similar texts similarity: ${similarPair.toFixed(4)}`);
      console.log(`   Different texts similarity: ${differentPair.toFixed(4)}`);
      console.log("");

      // Euclidean distance
      console.log("8. Euclidean Distance");
      const euclideanDistance = EmbeddingService.euclideanDistance(
         similarityEmbeddings[0],
         similarityEmbeddings[1]
      );
      console.log(
         `   Euclidean distance between similar texts: ${euclideanDistance.toFixed(
            4
         )}`
      );
      console.log("");

      // Find most similar embedding
      console.log("9. Find Most Similar");
      const queryEmbedding = similarityEmbeddings[0]; // "The cat sat on the mat."
      const candidates = similarityEmbeddings.slice(1); // Other embeddings

      const mostSimilar = EmbeddingService.findMostSimilar(
         queryEmbedding,
         candidates,
         "cosine"
      );

      console.log(`   Most similar to query: index ${mostSimilar.index}`);
      console.log(`   Similarity score: ${mostSimilar.similarity.toFixed(4)}`);
      console.log(
         `   Corresponding text: "${similarityTexts[mostSimilar.index + 1]}"`
      );
      console.log("");

      // Batch processing
      console.log("10. Batch Processing");
      const batchTexts = [
         "Machine learning is a subset of artificial intelligence.",
         "Deep learning uses neural networks with multiple layers.",
         "Natural language processing helps computers understand text.",
         "Computer vision enables machines to interpret visual information.",
         "Reinforcement learning learns through trial and error.",
      ];

      const batchEmbeddings = await client.embedding.embed({
         input: batchTexts,
         model: "openai/text-embedding-3-small",
      });

      console.log(`   Batch processed: ${batchEmbeddings.data.length} texts`);
      console.log(
         `   Total embeddings generated: ${batchEmbeddings.data.length}`
      );
      console.log("");

      console.log("✅ Embedding examples completed successfully!");
   } catch (error) {
      console.error("❌ Error during embedding examples:", error);
      process.exit(1);
   }
}

// Import EmbeddingService for similarity calculations
import { EmbeddingService } from "../src/services/EmbeddingService";

// Run the examples
if (require.main === module) {
   embeddingExamples().catch(console.error);
}
