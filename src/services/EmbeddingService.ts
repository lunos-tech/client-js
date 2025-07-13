import { BaseService } from "./base/BaseService";
import { EmbeddingRequest, EmbeddingResponse } from "../types/embedding";
import { ValidationUtils } from "../utils/validation";

export class EmbeddingService extends BaseService {
   /**
    * Creates embeddings for input text
    */
   async createEmbedding(
      request: EmbeddingRequest
   ): Promise<EmbeddingResponse> {
      ValidationUtils.validateEmbeddingRequest(request);
      this.log("Creating embedding", {
         inputType: typeof request.input,
         inputLength: Array.isArray(request.input) ? request.input.length : 1,
         model: request.model,
      });

      return this.makeRequest<EmbeddingResponse>("/v1/embeddings", {
         method: "POST",
         body: JSON.stringify(request),
      });
   }

   /**
    * Convenience method for embedding a single text
    */
   async embed(
      input: string | string[],
      model?: string,
      options?: Partial<EmbeddingRequest>
   ): Promise<EmbeddingResponse> {
      return this.createEmbedding({
         input,
         model,
         ...options,
      });
   }

   /**
    * Embeds a single text and returns the embedding vector
    */
   async embedText(text: string, model?: string): Promise<number[]> {
      const response = await this.embed(text, model);
      return response.data[0]?.embedding || [];
   }

   /**
    * Embeds multiple texts and returns an array of embedding vectors
    */
   async embedMultiple(texts: string[], model?: string): Promise<number[][]> {
      const response = await this.embed(texts, model);
      return response.data.map((item) => item.embedding);
   }

   /**
    * Embeds text with base64 encoding
    */
   async embedBase64(
      input: string | string[],
      model?: string,
      options?: Partial<EmbeddingRequest>
   ): Promise<EmbeddingResponse> {
      return this.createEmbedding({
         input,
         model,
         encoding_format: "base64",
         ...options,
      });
   }

   /**
    * Embeds text with float encoding
    */
   async embedFloat(
      input: string | string[],
      model?: string,
      options?: Partial<EmbeddingRequest>
   ): Promise<EmbeddingResponse> {
      return this.createEmbedding({
         input,
         model,
         encoding_format: "float",
         ...options,
      });
   }

   /**
    * Embeds text with custom dimensions
    */
   async embedWithDimensions(
      input: string | string[],
      dimensions: number,
      model?: string,
      options?: Partial<EmbeddingRequest>
   ): Promise<EmbeddingResponse> {
      if (dimensions < 1) {
         throw new Error("Dimensions must be at least 1");
      }

      return this.createEmbedding({
         input,
         model,
         dimensions,
         ...options,
      });
   }

   /**
    * Calculates cosine similarity between two embedding vectors
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
    * Calculates Euclidean distance between two embedding vectors
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
    * Finds the most similar embedding from a list
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
    * Validates embedding parameters
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
