import { BaseService } from "./base/BaseService";
import { EmbeddingRequest, EmbeddingResponse } from "../types/embedding";
import { ValidationUtils } from "../utils/validation";

/**
 * Service for handling text embedding operations with the Lunos AI API.
 * Provides both low-level API methods and high-level convenience methods
 * for creating vector embeddings from text, with support for various
 * encoding formats and dimensions.
 */
export class EmbeddingService extends BaseService {
   /**
    * Creates embeddings for input text using the Lunos AI API.
    *
    * This method handles the core embedding functionality, validating
    * the request parameters and making the API call to generate vector
    * representations of text. Supports both single texts and arrays of texts.
    *
    * @param request - Complete embedding request object containing
    *                  input text(s), model, encoding format, and dimensions
    * @returns Promise resolving to EmbeddingResponse with embedding vectors
    * @throws Error if request validation fails or API call fails
    *
    * @example
    * ```typescript
    * const response = await client.embedding.createEmbedding({
    *   input: "This is a sample text for embedding.",
    *   model: "openai/text-embedding-3-small",
    *   encoding_format: "float",
    *   dimensions: 1536,
    *   appId: "my-app"
    * });
    * ```
    */
   async createEmbedding(
      request: EmbeddingRequest
   ): Promise<EmbeddingResponse> {
      ValidationUtils.validateEmbeddingRequest(request);
      this.log("Creating embedding", {
         inputType: typeof request.input,
         inputLength: Array.isArray(request.input) ? request.input.length : 1,
         model: request.model,
         appId: request.appId,
      });

      return this.makeRequest<EmbeddingResponse>(
         "/v1/embeddings",
         {
            method: "POST",
            body: JSON.stringify(request),
         },
         {
            appId: request.appId,
         }
      );
   }

   /**
    * Convenience method for embedding text with structured parameters.
    *
    * This method provides a simplified interface for text embedding using
    * a structured object that separates the input from other options.
    *
    * @param options - Object containing input text(s) and optional embedding parameters
    * @returns Promise resolving to EmbeddingResponse with embedding vectors
    *
    * @example
    * ```typescript
    * const response = await client.embedding.embed({
    *   input: "This is a sample text for embedding.",
    *   model: "openai/text-embedding-3-small",
    *   encoding_format: "float",
    *   dimensions: 1536,
    *   appId: "my-app"
    * });
    * ```
    */
   async embed(options: {
      input: string | string[];
      model?: string;
      encoding_format?: "float" | "base64";
      dimensions?: number;
      user?: string;
      appId?: string;
   }): Promise<EmbeddingResponse> {
      return this.createEmbedding({
         input: options.input,
         model: options.model,
         encoding_format: options.encoding_format,
         dimensions: options.dimensions,
         user: options.user,
         appId: options.appId,
      });
   }

   /**
    * Embeds a single text and returns the embedding vector as an array.
    *
    * This convenience method simplifies the process when you only need
    * the raw embedding vector for a single text input.
    *
    * @param text - Single text string to embed
    * @param model - Optional model identifier for embedding generation
    * @param appId - Optional application identifier for analytics
    * @returns Promise resolving to number array representing the embedding vector
    * @throws Error if embedding generation fails or response is invalid
    *
    * @example
    * ```typescript
    * const embedding = await client.embedding.embedText(
    *   "This is a sample text for embedding.",
    *   "openai/text-embedding-3-small",
    *   "my-app"
    * );
    * console.log("Embedding dimensions:", embedding.length);
    * ```
    */
   async embedText(
      text: string,
      model?: string,
      appId?: string
   ): Promise<number[]> {
      const response = await this.embed({ input: text, model, appId });
      return response.data[0]?.embedding || [];
   }

   /**
    * Embeds multiple texts and returns an array of embedding vectors.
    *
    * This convenience method processes multiple texts and returns their
    * embedding vectors as a 2D array, useful for batch processing.
    *
    * @param texts - Array of text strings to embed
    * @param model - Optional model identifier for embedding generation
    * @param appId - Optional application identifier for analytics
    * @returns Promise resolving to 2D number array with embedding vectors
    * @throws Error if embedding generation fails or response is invalid
    *
    * @example
    * ```typescript
    * const embeddings = await client.embedding.embedMultiple([
    *   "First text for embedding",
    *   "Second text for embedding",
    *   "Third text for embedding"
    * ], "openai/text-embedding-3-small", "my-app");
    * console.log("Number of embeddings:", embeddings.length);
    * ```
    */
   async embedMultiple(
      texts: string[],
      model?: string,
      appId?: string
   ): Promise<number[][]> {
      const response = await this.embed({ input: texts, model, appId });
      return response.data.map((item) => item.embedding);
   }

   /**
    * Embeds text with base64 encoding format.
    *
    * This method automatically sets the encoding format to base64,
    * which can be useful for certain applications that require
    * base64-encoded embedding vectors.
    *
    * @param options - Object containing input text(s) and other parameters
    * @returns Promise resolving to EmbeddingResponse with base64-encoded embeddings
    *
    * @example
    * ```typescript
    * const response = await client.embedding.embedBase64({
    *   input: "Text for base64 embedding",
    *   model: "openai/text-embedding-3-small",
    *   dimensions: 1536
    * });
    * ```
    */
   async embedBase64(options: {
      input: string | string[];
      model?: string;
      dimensions?: number;
      user?: string;
   }): Promise<EmbeddingResponse> {
      return this.createEmbedding({
         input: options.input,
         model: options.model,
         encoding_format: "base64",
         dimensions: options.dimensions,
         user: options.user,
      });
   }

   /**
    * Embeds text with float encoding format.
    *
    * This method automatically sets the encoding format to float,
    * which is the standard format for most embedding applications.
    *
    * @param options - Object containing input text(s) and other parameters
    * @returns Promise resolving to EmbeddingResponse with float-encoded embeddings
    *
    * @example
    * ```typescript
    * const response = await client.embedding.embedFloat({
    *   input: "Text for float embedding",
    *   model: "openai/text-embedding-3-small",
    *   dimensions: 1536
    * });
    * ```
    */
   async embedFloat(options: {
      input: string | string[];
      model?: string;
      dimensions?: number;
      user?: string;
   }): Promise<EmbeddingResponse> {
      return this.createEmbedding({
         input: options.input,
         model: options.model,
         encoding_format: "float",
         dimensions: options.dimensions,
         user: options.user,
      });
   }

   /**
    * Embeds text with custom dimensions specification.
    *
    * This method allows for explicit dimension specification while maintaining
    * the structured parameter approach.
    *
    * @param options - Object containing input text(s), dimensions, and other parameters
    * @returns Promise resolving to EmbeddingResponse with custom-dimension embeddings
    * @throws Error if dimensions is less than 1
    *
    * @example
    * ```typescript
    * const response = await client.embedding.embedWithDimensions({
    *   input: "Text for custom dimension embedding",
    *   dimensions: 1024,
    *   model: "openai/text-embedding-3-small"
    * });
    * ```
    */
   async embedWithDimensions(options: {
      input: string | string[];
      dimensions: number;
      model?: string;
      encoding_format?: "float" | "base64";
      user?: string;
   }): Promise<EmbeddingResponse> {
      if (options.dimensions < 1) {
         throw new Error("Dimensions must be at least 1");
      }

      return this.createEmbedding({
         input: options.input,
         model: options.model,
         dimensions: options.dimensions,
         encoding_format: options.encoding_format,
         user: options.user,
      });
   }

   /**
    * Calculates cosine similarity between two embedding vectors.
    *
    * This static method computes the cosine similarity between two
    * embedding vectors, which is a common metric for measuring
    * semantic similarity between texts.
    *
    * @param a - First embedding vector as number array
    * @param b - Second embedding vector as number array
    * @returns Cosine similarity value between 0 and 1 (1 = identical, 0 = orthogonal)
    * @throws Error if vectors have different lengths
    *
    * @example
    * ```typescript
    * const similarity = EmbeddingService.cosineSimilarity(
    *   embedding1,
    *   embedding2
    * );
    * console.log("Similarity:", similarity); // 0.0 to 1.0
    * ```
    */
   static cosineSimilarity(a: number[], b: number[]): number {
      if (a.length !== b.length) {
         throw new Error("Embedding vectors must have the same length");
      }

      let dotProduct = 0;
      let normA = 0;
      let normB = 0;

      for (let i = 0; i < a.length; i++) {
         dotProduct += a[i] * b[i];
         normA += a[i] * a[i];
         normB += b[i] * b[i];
      }

      normA = Math.sqrt(normA);
      normB = Math.sqrt(normB);

      if (normA === 0 || normB === 0) {
         return 0;
      }

      return dotProduct / (normA * normB);
   }

   /**
    * Calculates Euclidean distance between two embedding vectors.
    *
    * This static method computes the Euclidean distance between two
    * embedding vectors, which is another common metric for measuring
    * vector similarity (lower distance = more similar).
    *
    * @param a - First embedding vector as number array
    * @param b - Second embedding vector as number array
    * @returns Euclidean distance value (0 = identical, higher = more different)
    * @throws Error if vectors have different lengths
    *
    * @example
    * ```typescript
    * const distance = EmbeddingService.euclideanDistance(
    *   embedding1,
    *   embedding2
    * );
    * console.log("Distance:", distance); // 0.0 to infinity
    * ```
    */
   static euclideanDistance(a: number[], b: number[]): number {
      if (a.length !== b.length) {
         throw new Error("Embedding vectors must have the same length");
      }

      let sum = 0;
      for (let i = 0; i < a.length; i++) {
         const diff = a[i] - b[i];
         sum += diff * diff;
      }

      return Math.sqrt(sum);
   }

   /**
    * Finds the most similar embedding from a list of embeddings.
    *
    * This static method compares a query embedding against a list of
    * candidate embeddings and returns the index and similarity score
    * of the most similar one.
    *
    * @param queryEmbedding - Query embedding vector to compare against
    * @param embeddings - Array of candidate embedding vectors
    * @param metric - Similarity metric to use ("cosine" or "euclidean")
    * @returns Object containing index of most similar embedding and similarity score
    * @throws Error if embeddings array is empty
    *
    * @example
    * ```typescript
    * const result = EmbeddingService.findMostSimilar(
    *   queryEmbedding,
    *   candidateEmbeddings,
    *   "cosine"
    * );
    * console.log("Most similar index:", result.index);
    * console.log("Similarity score:", result.similarity);
    * ```
    */
   static findMostSimilar(
      queryEmbedding: number[],
      embeddings: number[][],
      metric: "cosine" | "euclidean" = "cosine"
   ): { index: number; similarity: number } {
      if (embeddings.length === 0) {
         throw new Error("Embeddings array cannot be empty");
      }

      let bestIndex = 0;
      let bestSimilarity =
         metric === "cosine"
            ? this.cosineSimilarity(queryEmbedding, embeddings[0])
            : -this.euclideanDistance(queryEmbedding, embeddings[0]);

      for (let i = 1; i < embeddings.length; i++) {
         const similarity =
            metric === "cosine"
               ? this.cosineSimilarity(queryEmbedding, embeddings[i])
               : -this.euclideanDistance(queryEmbedding, embeddings[i]);

         if (similarity > bestSimilarity) {
            bestSimilarity = similarity;
            bestIndex = i;
         }
      }

      return { index: bestIndex, similarity: bestSimilarity };
   }

   /**
    * Validates embedding parameters for correctness.
    *
    * This static method performs validation on embedding parameters
    * to ensure they meet the API requirements before making requests.
    *
    * @param input - Text input(s) to validate
    * @param dimensions - Optional dimensions to validate
    * @throws Error if parameters are invalid
    *
    * @example
    * ```typescript
    * EmbeddingService.validateEmbeddingParams(
    *   "Sample text for embedding",
    *   1536
    * );
    * ```
    */
   static validateEmbeddingParams(
      input: string | string[],
      dimensions?: number
   ): void {
      if (!input) {
         throw new Error("Input is required");
      }

      if (typeof input === "string") {
         if (input.trim().length === 0) {
            throw new Error("Input text cannot be empty");
         }
      } else if (Array.isArray(input)) {
         if (input.length === 0) {
            throw new Error("Input array cannot be empty");
         }
         for (const text of input) {
            if (typeof text !== "string" || text.trim().length === 0) {
               throw new Error("All input texts must be non-empty strings");
            }
         }
      } else {
         throw new Error("Input must be a string or array of strings");
      }

      if (dimensions !== undefined && dimensions < 1) {
         throw new Error("Dimensions must be at least 1");
      }
   }
}
