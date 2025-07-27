export interface BaseRequest {
   /** Model identifier */
   model?: string;
   /** User identifier for tracking */
   user?: string;
   /** Application identifier for analytics and usage tracking */
   appId?: string;
}

export interface BaseResponse {
   /** Response object type */
   object: string;
   /** Creation timestamp */
   created: number;
   /** Model used for the request */
   model: string;
}

export interface Usage {
   /** Number of prompt tokens */
   prompt_tokens: number;
   /** Number of completion tokens */
   completion_tokens?: number;
   /** Total number of tokens */
   total_tokens: number;
}

export interface StreamChunk {
   /** Chunk object type */
   object: string;
   /** Creation timestamp */
   created: number;
   /** Model used */
   model: string;
   /** Array of choices */
   choices: Array<{
      /** Choice index */
      index: number;
      /** Delta content */
      delta: {
         /** Role of the message */
         role?: string;
         /** Content of the message */
         content?: string;
         /** Function call if applicable */
         function_call?: any;
         /** Tool calls if applicable */
         tool_calls?: any[];
      };
      /** Finish reason */
      finish_reason?: string;
   }>;
   /** Usage information */
   usage?: Usage;
}

export interface StreamEnd {
   /** End marker */
   data: "[DONE]";
}

export type StreamResponse = StreamChunk | StreamEnd;

export interface RetryConfig {
   /** Maximum number of retries */
   maxRetries: number;
   /** Base delay between retries */
   baseDelay: number;
   /** Maximum delay between retries */
   maxDelay: number;
   /** Whether to use exponential backoff */
   exponentialBackoff: boolean;
   /** Status codes to retry on */
   retryStatusCodes: number[];
}
