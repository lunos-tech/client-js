import { BaseRequest, BaseResponse, Usage } from "./common";

export interface EmbeddingRequest extends BaseRequest {
   /** Input text or array of texts to embed */
   input: string | string[];
   /** Encoding format for embeddings */
   encoding_format?: "float" | "base64";
   /** Dimensions for embeddings */
   dimensions?: number;
   /** User identifier */
   user?: string;
}

export interface EmbeddingData {
   /** Object type */
   object: "embedding";
   /** Embedding vector */
   embedding: number[];
   /** Index of the embedding */
   index: number;
}

export interface EmbeddingResponse extends BaseResponse {
   /** Response object type */
   object: "list";
   /** Generated embeddings */
   data: EmbeddingData[];
   /** Usage statistics */
   usage: Usage;
}
