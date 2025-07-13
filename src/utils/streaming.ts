import { ChatCompletionChunk } from "../types/chat";
import { LunosError } from "../client/errors/LunosError";

export interface StreamProcessorOptions {
   /** Callback for each chunk received */
   onChunk?: (chunk: ChatCompletionChunk) => void;
   /** Callback for stream completion */
   onComplete?: () => void;
   /** Callback for stream error */
   onError?: (error: Error) => void;
   /** Whether to accumulate the full response */
   accumulate?: boolean;
}

export interface StreamProcessorResult {
   /** Full accumulated response if requested */
   fullResponse?: string;
   /** Whether stream completed successfully */
   completed: boolean;
   /** Error if any occurred */
   error?: Error;
}

export class StreamProcessor {
   private decoder: TextDecoder;
   private buffer: string;

   constructor() {
      this.decoder = new TextDecoder();
      this.buffer = "";
   }

   /**
    * Processes a streaming response from the API
    */
   async processStream(
      stream: ReadableStream<Uint8Array>,
      options: StreamProcessorOptions = {}
   ): Promise<StreamProcessorResult> {
      const { onChunk, onComplete, onError, accumulate = false } = options;

      const reader = stream.getReader();
      let fullResponse = "";
      let completed = false;
      let error: Error | undefined;

      try {
         while (true) {
            const { done, value } = await reader.read();

            if (done) {
               completed = true;
               break;
            }

            // Decode the chunk
            this.buffer += this.decoder.decode(value, { stream: true });

            // Process complete lines
            const lines = this.buffer.split("\n");
            this.buffer = lines.pop() || "";

            for (const line of lines) {
               if (line.trim() === "") continue;

               if (line.startsWith("data: ")) {
                  const data = line.slice(6);

                  if (data === "[DONE]") {
                     completed = true;
                     break;
                  }

                  try {
                     const parsed: ChatCompletionChunk = JSON.parse(data);

                     if (onChunk) {
                        onChunk(parsed);
                     }

                     // Accumulate content if requested
                     if (accumulate && parsed.choices?.[0]?.delta?.content) {
                        fullResponse += parsed.choices[0].delta.content;
                     }
                  } catch (e) {
                     // Ignore parsing errors for incomplete chunks
                     console.warn("Failed to parse stream chunk:", e);
                  }
               }
            }
         }
      } catch (e) {
         error = e instanceof Error ? e : new Error(String(e));
         if (onError) {
            onError(error);
         }
      } finally {
         reader.releaseLock();
      }

      if (onComplete && completed) {
         onComplete();
      }

      return {
         fullResponse: accumulate ? fullResponse : undefined,
         completed,
         error,
      };
   }

   /**
    * Creates a readable stream from a response stream
    */
   createReadableStream(
      stream: ReadableStream<Uint8Array>,
      options: StreamProcessorOptions = {}
   ): ReadableStream<string> {
      const { onChunk } = options;

      return new ReadableStream({
         start: async (controller) => {
            try {
               await this.processStream(stream, {
                  ...options,
                  onChunk: (chunk) => {
                     if (onChunk) onChunk(chunk);
                     if (chunk.choices?.[0]?.delta?.content) {
                        controller.enqueue(chunk.choices[0].delta.content);
                     }
                  },
                  onComplete: () => controller.close(),
                  onError: (error) => controller.error(error),
               });
            } catch (error) {
               controller.error(error);
            }
         },
      });
   }

   /**
    * Processes a stream and returns the full response as a string
    */
   async processStreamToString(
      stream: ReadableStream<Uint8Array>,
      onChunk?: (chunk: string) => void
   ): Promise<string> {
      const result = await this.processStream(stream, {
         onChunk: (chunk) => {
            if (onChunk && chunk.choices?.[0]?.delta?.content) {
               onChunk(chunk.choices[0].delta.content);
            }
         },
         accumulate: true,
      });

      if (result.error) {
         throw result.error;
      }

      return result.fullResponse || "";
   }

   /**
    * Validates a stream response
    */
   static validateStreamResponse(response: Response): void {
      if (!response.ok) {
         throw new LunosError(
            `Stream request failed: ${response.status} ${response.statusText}`,
            response.status
         );
      }

      if (!response.body) {
         throw new LunosError("No response body for streaming request");
      }
   }
}
