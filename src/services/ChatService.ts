import { BaseService } from "./base/BaseService";
import {
   ChatCompletionRequest,
   ChatCompletionResponse,
   ChatMessage,
   ChatCompletionChunk,
} from "../types/chat";
import { StreamProcessor } from "../utils/streaming";
import { ValidationUtils } from "../utils/validation";

export class ChatService extends BaseService {
   /**
    * Creates a chat completion
    */
   async createCompletion(
      request: ChatCompletionRequest
   ): Promise<ChatCompletionResponse> {
      ValidationUtils.validateChatCompletionRequest(request);
      this.log("Creating chat completion", {
         model: request.model,
         messages: request.messages.length,
         fallback_model: request.fallback_model,
      });

      return this.makeRequest<ChatCompletionResponse>(
         "/v1/chat/completions",
         {
            method: "POST",
            body: JSON.stringify(request),
         },
         {
            fallback_model: request.fallback_model,
         }
      );
   }

   /**
    * Creates a streaming chat completion
    */
   async createCompletionStream(
      request: ChatCompletionRequest
   ): Promise<ReadableStream<Uint8Array>> {
      ValidationUtils.validateChatCompletionRequest(request);
      this.log("Creating streaming chat completion", {
         model: request.model,
         messages: request.messages.length,
         fallback_model: request.fallback_model,
      });

      const streamRequest = { ...request, stream: true };
      return this.makeStreamRequest(
         "/v1/chat/completions",
         {
            method: "POST",
            body: JSON.stringify(streamRequest),
         },
         {
            fallback_model: request.fallback_model,
         }
      );
   }

   /**
    * Creates a streaming chat completion that returns a readable stream
    * Similar to OpenAI's streaming API
    */
   async createCompletionWithStream(
      request: ChatCompletionRequest,
      onChunk?: (chunk: string) => void
   ): Promise<ReadableStream<Uint8Array>> {
      const stream = await this.createCompletionStream(request);

      if (onChunk) {
         // If callback is provided, process the stream and call the callback
         const processor = new StreamProcessor();
         processor.processStream(stream, {
            onChunk: (chunk) => {
               if (chunk.choices?.[0]?.delta?.content) {
                  onChunk(chunk.choices[0].delta.content);
               }
            },
         });
      }

      return stream;
   }

   /**
    * Creates a streaming chat completion and returns the full response as a string
    * For backward compatibility
    */
   async createCompletionWithStreamToString(
      request: ChatCompletionRequest,
      onChunk?: (chunk: string) => void
   ): Promise<string> {
      const stream = await this.createCompletionStream(request);
      const processor = new StreamProcessor();
      return processor.processStreamToString(stream, onChunk);
   }

   /**
    * Gets a specific generation by ID
    */
   async getGeneration(id: string): Promise<any> {
      if (!id || typeof id !== "string") {
         throw new Error("Generation ID is required");
      }

      this.log("Getting generation", { id });
      return this.makeRequest(`/v1/chat/generation/${id}`);
   }

   /**
    * Convenience method for simple chat completions
    */
   async chat(
      messages: ChatMessage[],
      model?: string,
      options?: Partial<ChatCompletionRequest>
   ): Promise<ChatCompletionResponse> {
      return this.createCompletion({
         messages,
         model,
         ...options,
      });
   }

   /**
    * Convenience method for streaming chat completions
    */
   async chatStream(
      messages: ChatMessage[],
      model?: string,
      onChunk?: (chunk: string) => void,
      options?: Partial<ChatCompletionRequest>
   ): Promise<ReadableStream<Uint8Array>> {
      return this.createCompletionWithStream(
         {
            messages,
            model,
            ...options,
         },
         onChunk
      );
   }

   /**
    * Creates a simple chat completion with a single user message
    */
   async chatWithUser(
      userMessage: string,
      model?: string,
      options?: Partial<ChatCompletionRequest>
   ): Promise<ChatCompletionResponse> {
      return this.chat(
         [{ role: "user", content: userMessage }],
         model,
         options
      );
   }

   /**
    * Creates a chat completion with system and user messages
    */
   async chatWithSystem(
      systemMessage: string,
      userMessage: string,
      model?: string,
      options?: Partial<ChatCompletionRequest>
   ): Promise<ChatCompletionResponse> {
      return this.chat(
         [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage },
         ],
         model,
         options
      );
   }

   /**
    * Creates a conversation with multiple messages
    */
   async createConversation(
      messages: ChatMessage[],
      model?: string,
      options?: Partial<ChatCompletionRequest>
   ): Promise<ChatCompletionResponse> {
      return this.chat(messages, model, options);
   }

   /**
    * Gets API usage information
    */
   async getUsage(): Promise<any> {
      return this.makeRequest("/v1/usage");
   }

   /**
    * Gets account information
    */
   async getAccount(): Promise<any> {
      return this.makeRequest("/v1/account");
   }

   /**
    * Validates chat messages
    */
   static validateMessages(messages: ChatMessage[]): void {
      if (!Array.isArray(messages) || messages.length === 0) {
         throw new Error("Messages array is required and cannot be empty");
      }

      for (const message of messages) {
         if (!message.role || !message.content) {
            throw new Error("Each message must have a role and content");
         }

         if (
            !["system", "user", "assistant", "function", "tool"].includes(
               message.role
            )
         ) {
            throw new Error(`Invalid role: ${message.role}`);
         }
      }
   }
}
