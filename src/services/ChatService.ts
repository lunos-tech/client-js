import { BaseService } from "./base/BaseService";
import {
   ChatCompletionRequest,
   ChatCompletionResponse,
   ChatMessage,
   ChatCompletionChunk,
} from "../types/chat";
import { StreamProcessor } from "../utils/streaming";
import { ValidationUtils } from "../utils/validation";

/**
 * Service for handling chat completion operations with the Lunos AI API.
 * Provides both synchronous and streaming chat completion capabilities,
 * along with various convenience methods for common chat scenarios.
 */
export class ChatService extends BaseService {
   /**
    * Creates a chat completion using the Lunos AI API.
    *
    * This method handles the core chat completion functionality, validating
    * the request parameters and making the API call to generate responses
    * based on conversation history. Supports fallback models for reliability.
    *
    * @param request - Complete chat completion request object containing
    *                  messages, model, parameters, and optional fallback model
    * @returns Promise resolving to ChatCompletionResponse with generated response
    * @throws Error if request validation fails or API call fails
    *
    * @example
    * ```typescript
    * const response = await client.chat.createCompletion({
    *   model: "openai/gpt-4.1-mini",
    *   messages: [
    *     { role: "user", content: "Hello! Can you tell me a short joke?" }
    *   ],
    *   max_tokens: 100,
    *   fallback_model: "openai/gpt-4.1-mini"
    * });
    * ```
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
    * Creates a streaming chat completion that returns a raw stream.
    *
    * This method creates a streaming chat completion and returns the raw
    * ReadableStream for advanced stream processing. The stream contains
    * Server-Sent Events (SSE) chunks that need to be parsed.
    *
    * @param request - Complete chat completion request object
    * @returns Promise resolving to ReadableStream<Uint8Array> for raw stream processing
    * @throws Error if request validation fails or API call fails
    *
    * @example
    * ```typescript
    * const stream = await client.chat.createCompletionStream({
    *   model: "openai/gpt-4.1-mini",
    *   messages: [
    *     { role: "user", content: "Write a haiku about programming." }
    *   ]
    * });
    * ```
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
    * Creates a streaming chat completion with optional callback processing.
    *
    * This method creates a streaming chat completion and optionally processes
    * the stream with a callback function. Similar to OpenAI's streaming API,
    * it provides real-time access to generated content chunks.
    *
    * @param request - Complete chat completion request object
    * @param onChunk - Optional callback function called for each content chunk
    * @returns Promise resolving to ReadableStream<Uint8Array> for further processing
    * @throws Error if request validation fails or API call fails
    *
    * @example
    * ```typescript
    * let streamedResponse = "";
    * const stream = await client.chat.createCompletionWithStream(
    *   {
    *     model: "openai/gpt-4.1-mini",
    *     messages: [
    *       { role: "user", content: "Write a haiku about programming." }
    *     ]
    *   },
    *   (chunk) => {
    *     streamedResponse += chunk;
    *     process.stdout.write(chunk);
    *   }
    * );
    * ```
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
    * Creates a streaming chat completion and returns the full response as a string.
    *
    * This method is provided for backward compatibility and convenience.
    * It processes the entire stream and returns the complete response as a string,
    * while optionally calling a callback for each chunk during processing.
    *
    * @param request - Complete chat completion request object
    * @param onChunk - Optional callback function called for each content chunk
    * @returns Promise resolving to the complete response as a string
    * @throws Error if request validation fails or API call fails
    *
    * @example
    * ```typescript
    * const response = await client.chat.createCompletionWithStreamToString(
    *   {
    *     model: "openai/gpt-4.1-mini",
    *     messages: [
    *       { role: "user", content: "Explain quantum computing." }
    *     ]
    *   },
    *   (chunk) => console.log("Chunk:", chunk)
    * );
    * ```
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
    * Gets a specific generation by ID from the API.
    *
    * This method retrieves information about a specific chat completion
    * generation using its unique identifier.
    *
    * @param id - Unique identifier of the generation to retrieve
    * @returns Promise resolving to generation information
    * @throws Error if ID is not provided or API call fails
    *
    * @example
    * ```typescript
    * const generation = await client.chat.getGeneration("gen_123456789");
    * ```
    */
   async getGeneration(id: string): Promise<any> {
      if (!id || typeof id !== "string") {
         throw new Error("Generation ID is required");
      }

      this.log("Getting generation", { id });
      return this.makeRequest(`/v1/chat/generation/${id}`);
   }

   /**
    * Convenience method for simple chat completions with structured parameters.
    *
    * This method provides a simplified interface for chat completions using
    * a structured object that separates messages from other options.
    *
    * @param options - Object containing messages and optional completion parameters
    * @returns Promise resolving to ChatCompletionResponse with generated response
    *
    * @example
    * ```typescript
    * const response = await client.chat.chat({
    *   messages: [
    *     { role: "user", content: "What is machine learning?" }
    *   ],
    *   model: "openai/gpt-4.1-mini",
    *   max_tokens: 200,
    *   temperature: 0.7
    * });
    * ```
    */
   async chat(options: {
      messages: ChatMessage[];
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stop?: string | string[];
      n?: number;
      stream?: boolean;
      fallback_model?: string;
      user?: string;
   }): Promise<ChatCompletionResponse> {
      return this.createCompletion({
         messages: options.messages,
         model: options.model,
         max_tokens: options.max_tokens,
         temperature: options.temperature,
         top_p: options.top_p,
         frequency_penalty: options.frequency_penalty,
         presence_penalty: options.presence_penalty,
         stop: options.stop,
         n: options.n,
         stream: options.stream,
         fallback_model: options.fallback_model,
         user: options.user,
      });
   }

   /**
    * Convenience method for streaming chat completions with structured parameters.
    *
    * This method provides a simplified interface for streaming chat completions
    * using a structured object that separates messages from other options.
    *
    * @param options - Object containing messages, callback, and optional parameters
    * @returns Promise resolving to ReadableStream<Uint8Array> for stream processing
    *
    * @example
    * ```typescript
    * const stream = await client.chat.chatStream({
    *   messages: [
    *     { role: "user", content: "Write a story about a robot." }
    *   ],
    *   model: "openai/gpt-4.1-mini",
    *   onChunk: (chunk) => console.log(chunk),
    *   max_tokens: 500
    * });
    * ```
    */
   async chatStream(options: {
      messages: ChatMessage[];
      model?: string;
      onChunk?: (chunk: string) => void;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stop?: string | string[];
      n?: number;
      fallback_model?: string;
      user?: string;
   }): Promise<ReadableStream<Uint8Array>> {
      return this.createCompletionWithStream(
         {
            messages: options.messages,
            model: options.model,
            max_tokens: options.max_tokens,
            temperature: options.temperature,
            top_p: options.top_p,
            frequency_penalty: options.frequency_penalty,
            presence_penalty: options.presence_penalty,
            stop: options.stop,
            n: options.n,
            fallback_model: options.fallback_model,
            user: options.user,
         },
         options.onChunk
      );
   }

   /**
    * Creates a simple chat completion with a single user message.
    *
    * This convenience method simplifies chat completions when you only
    * need to send a single user message without complex conversation history.
    *
    * @param options - Object containing user message and optional parameters
    * @returns Promise resolving to ChatCompletionResponse with generated response
    *
    * @example
    * ```typescript
    * const response = await client.chat.chatWithUser({
    *   userMessage: "Explain the concept of recursion",
    *   model: "openai/gpt-4.1-mini",
    *   max_tokens: 300
    * });
    * ```
    */
   async chatWithUser(options: {
      userMessage: string;
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stop?: string | string[];
      n?: number;
      fallback_model?: string;
      user?: string;
   }): Promise<ChatCompletionResponse> {
      return this.chat({
         messages: [{ role: "user", content: options.userMessage }],
         model: options.model,
         max_tokens: options.max_tokens,
         temperature: options.temperature,
         top_p: options.top_p,
         frequency_penalty: options.frequency_penalty,
         presence_penalty: options.presence_penalty,
         stop: options.stop,
         n: options.n,
         fallback_model: options.fallback_model,
         user: options.user,
      });
   }

   /**
    * Creates a chat completion with system and user messages.
    *
    * This convenience method is useful for setting up conversations with
    * a system prompt that defines the AI's behavior or role.
    *
    * @param options - Object containing system message, user message, and optional parameters
    * @returns Promise resolving to ChatCompletionResponse with generated response
    *
    * @example
    * ```typescript
    * const response = await client.chat.chatWithSystem({
    *   systemMessage: "You are a helpful coding assistant.",
    *   userMessage: "Write a function to calculate fibonacci numbers",
    *   model: "openai/gpt-4.1-mini",
    *   max_tokens: 400
    * });
    * ```
    */
   async chatWithSystem(options: {
      systemMessage: string;
      userMessage: string;
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stop?: string | string[];
      n?: number;
      fallback_model?: string;
      user?: string;
   }): Promise<ChatCompletionResponse> {
      return this.chat({
         messages: [
            { role: "system", content: options.systemMessage },
            { role: "user", content: options.userMessage },
         ],
         model: options.model,
         max_tokens: options.max_tokens,
         temperature: options.temperature,
         top_p: options.top_p,
         frequency_penalty: options.frequency_penalty,
         presence_penalty: options.presence_penalty,
         stop: options.stop,
         n: options.n,
         fallback_model: options.fallback_model,
         user: options.user,
      });
   }

   /**
    * Creates a conversation with multiple messages.
    *
    * This method is an alias for the chat method, providing semantic clarity
    * when working with multi-turn conversations.
    *
    * @param options - Object containing messages and optional parameters
    * @returns Promise resolving to ChatCompletionResponse with generated response
    *
    * @example
    * ```typescript
    * const response = await client.chat.createConversation({
    *   messages: [
    *     { role: "system", content: "You are a helpful assistant." },
    *     { role: "user", content: "Hello!" },
    *     { role: "assistant", content: "Hi there! How can I help you today?" },
    *     { role: "user", content: "What's the weather like?" }
    *   ],
    *   model: "openai/gpt-4.1-mini"
    * });
    * ```
    */
   async createConversation(options: {
      messages: ChatMessage[];
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stop?: string | string[];
      n?: number;
      fallback_model?: string;
      user?: string;
   }): Promise<ChatCompletionResponse> {
      return this.chat(options);
   }

   /**
    * Gets API usage information for the current account.
    *
    * This method retrieves usage statistics and billing information
    * for the authenticated API key.
    *
    * @returns Promise resolving to usage information object
    * @throws Error if API call fails or endpoint is not available
    *
    * @example
    * ```typescript
    * const usage = await client.chat.getUsage();
    * console.log("Total tokens used:", usage.total_tokens);
    * ```
    */
   async getUsage(): Promise<any> {
      return this.makeRequest("/v1/usage");
   }

   /**
    * Gets account information for the authenticated API key.
    *
    * This method retrieves account details, limits, and settings
    * for the current API key.
    *
    * @returns Promise resolving to account information object
    * @throws Error if API call fails or endpoint is not available
    *
    * @example
    * ```typescript
    * const account = await client.chat.getAccount();
    * console.log("Account ID:", account.id);
    * ```
    */
   async getAccount(): Promise<any> {
      return this.makeRequest("/v1/account");
   }

   /**
    * Validates chat messages for correctness and completeness.
    *
    * This static method performs validation on chat message arrays
    * to ensure they meet the API requirements before making requests.
    *
    * @param messages - Array of chat messages to validate
    * @throws Error if messages are invalid or incomplete
    *
    * @example
    * ```typescript
    * ChatService.validateMessages([
    *   { role: "user", content: "Hello" },
    *   { role: "assistant", content: "Hi there!" }
    * ]);
    * ```
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
