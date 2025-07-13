import { BaseRequest, BaseResponse, Usage } from "./common";

export type ChatRole = "system" | "user" | "assistant" | "function" | "tool";

export interface ChatMessage {
   /** Role of the message sender */
   role: ChatRole;
   /** Content of the message */
   content: string;
   /** Name of the function or tool (optional) */
   name?: string;
   /** Function call details (optional) */
   function_call?: {
      /** Name of the function */
      name: string;
      /** Arguments for the function call */
      arguments: string;
   };
   /** Tool calls (optional) */
   tool_calls?: Array<{
      /** Tool call ID */
      id: string;
      /** Type of tool */
      type: "function";
      /** Function details */
      function: {
         /** Function name */
         name: string;
         /** Function arguments */
         arguments: string;
      };
   }>;
}

export interface ChatCompletionRequest extends BaseRequest {
   /** Array of messages in the conversation */
   messages: ChatMessage[];
   /** Maximum number of tokens to generate */
   max_tokens?: number;
   /** Temperature for controlling randomness (0-2) */
   temperature?: number;
   /** Top-p sampling parameter (0-1) */
   top_p?: number;
   /** Number of completions to generate */
   n?: number;
   /** Whether to stream the response */
   stream?: boolean;
   /** Stop sequences */
   stop?: string | string[];
   /** Presence penalty (-2 to 2) */
   presence_penalty?: number;
   /** Frequency penalty (-2 to 2) */
   frequency_penalty?: number;
   /** Logit bias for specific tokens */
   logit_bias?: Record<string, number>;
   /** Whether to return log probabilities */
   logprobs?: boolean;
   /** Number of top log probabilities to return */
   top_logprobs?: number;
   /** Response format */
   response_format?: {
      /** Type of response format */
      type: "text" | "json_object";
   };
   /** Seed for reproducible results */
   seed?: number;
   /** Tools available to the model */
   tools?: Array<{
      /** Tool type */
      type: "function";
      /** Function definition */
      function: {
         /** Function name */
         name: string;
         /** Function description */
         description?: string;
         /** Function parameters */
         parameters: {
            /** Parameter type */
            type: "object";
            /** Parameter properties */
            properties: Record<string, any>;
            /** Required parameters */
            required?: string[];
         };
      };
   }>;
   /** Tool choice */
   tool_choice?:
      | "none"
      | "auto"
      | {
           /** Tool choice type */
           type: "function";
           /** Function name */
           function: {
              /** Function name */
              name: string;
           };
        };
}

export interface ChatCompletionChoice {
   /** Choice index */
   index: number;
   /** Generated message */
   message: ChatMessage;
   /** Reason for finishing */
   finish_reason: string;
   /** Log probabilities if requested */
   logprobs?: {
      /** Token log probabilities */
      token_logprobs: number[];
      /** Top log probabilities */
      top_logprobs: Array<Record<string, number>>;
      /** Token text */
      text_offset: number[];
   };
}

export interface ChatCompletionResponse extends BaseResponse {
   /** Response object type */
   object: "chat.completion";
   /** Generated choices */
   choices: ChatCompletionChoice[];
   /** Usage statistics */
   usage: Usage;
   /** System fingerprint */
   system_fingerprint?: string;
}

export interface ChatCompletionChunk {
   /** Chunk object type */
   object: "chat.completion.chunk";
   /** Creation timestamp */
   created: number;
   /** Model used */
   model: string;
   /** Generated choices */
   choices: Array<{
      /** Choice index */
      index: number;
      /** Delta content */
      delta: Partial<ChatMessage>;
      /** Finish reason */
      finish_reason?: string;
   }>;
   /** System fingerprint */
   system_fingerprint?: string;
}
