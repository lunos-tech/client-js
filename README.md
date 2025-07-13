# Lunos AI Client Library

[![npm version](https://badge.fury.io/js/%40lunos%2Fclient.svg)](https://badge.fury.io/js/%40lunos%2Fclient)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official TypeScript client library for the [Lunos AI API](https://lunos.tech) - A comprehensive AI proxy service supporting multiple AI providers including OpenAI, Anthropic, Google, and more.

## Features

-  🤖 **Multi-Provider Support**: Access OpenAI, Anthropic, Google, and other AI models through a single API
-  💬 **Chat Completions**: Full support for chat conversations with streaming
-  🎨 **Image Generation**: Create images with DALL-E, Midjourney, and other models
-  🔊 **Audio Generation**: Text-to-speech with multiple voices and formats
-  📊 **Embeddings**: Generate and work with text embeddings
-  🔍 **Model Discovery**: Browse and search available models
-  ⚡ **TypeScript First**: Full TypeScript support with comprehensive type definitions
-  🛡️ **Error Handling**: Robust error handling with specific error types
-  🔄 **Retry Logic**: Automatic retry with exponential backoff
-  📁 **File Operations**: Built-in utilities for saving generated content
-  🎯 **SOLID Principles**: Well-architected, extensible, and maintainable code

## Installation

```bash
npm install @lunos/client
```

```bash
yarn add @lunos/client
```

```bash
pnpm add @lunos/client
```

## Quick Start

```typescript
import { LunosClient } from "@lunos/client";

// Initialize the client
const client = new LunosClient({
   apiKey: "your-api-key-here",
   baseUrl: "https://api.lunos.tech",
});

// Chat completion
const response = await client.chat.createCompletion({
   model: "openai/gpt-4",
   messages: [{ role: "user", content: "Hello, how are you?" }],
});

console.log(response.choices[0].message.content);
```

## API Reference

### Client Configuration

```typescript
import { LunosClient, LunosConfig } from "@lunos/client";

const config: Partial<LunosConfig> = {
   apiKey: "your-api-key",
   baseUrl: "https://api.lunos.tech",
   timeout: 30000,
   retries: 3,
   retryDelay: 1000,
   debug: false,
   headers: {
      "Custom-Header": "value",
   },
};

const client = new LunosClient(config);
```

### Chat Completions

```typescript
// Simple chat completion
const response = await client.chat.createCompletion({
   model: "openai/gpt-4",
   messages: [{ role: "user", content: "Write a short story about a robot." }],
   temperature: 0.7,
   max_tokens: 500,
});

// Streaming chat completion with callback
let fullResponse = "";
const stream = await client.chat.createCompletionWithStream(
   {
      model: "openai/gpt-4",
      messages: [{ role: "user", content: "Write a poem about AI." }],
   },
   (chunk) => {
      fullResponse += chunk;
      process.stdout.write(chunk);
   }
);

// Streaming chat completion without callback (returns stream)
const stream = await client.chat.createCompletionStream({
   model: "openai/gpt-4",
   messages: [{ role: "user", content: "Explain quantum computing." }],
});

// Process the stream manually
const reader = stream.getReader();
const decoder = new TextDecoder();
let buffer = "";

try {
   while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
         if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
               const parsed = JSON.parse(data);
               if (parsed.choices?.[0]?.delta?.content) {
                  process.stdout.write(parsed.choices[0].delta.content);
               }
            } catch (e) {
               // Ignore parsing errors
            }
         }
      }
   }
} finally {
   reader.releaseLock();
}

// Convenience methods
const response = await client.chat.chatWithUser(
   "What is the capital of France?",
   "openai/gpt-3.5-turbo"
);

const response = await client.chat.chatWithSystem(
   "You are a helpful assistant.",
   "What is 2+2?",
   "openai/gpt-4"
);
```

### Image Generation

```typescript
// Generate an image
const image = await client.image.generateImage({
   model: "openai/dall-e-3",
   prompt: "A beautiful sunset over mountains",
   size: "1024x1024",
   quality: "hd",
});

// Convenience methods
const image = await client.image.generate(
   "A futuristic city skyline",
   "openai/dall-e-3"
);

const image = await client.image.generateWithSize(
   "A cat playing with yarn",
   512,
   512,
   "openai/dall-e-2"
);

const image = await client.image.generateHD(
   "A detailed portrait of a dragon",
   "openai/dall-e-3"
);

// Generate multiple images
const images = await client.image.generateMultiple(
   "A flower in different seasons",
   4,
   "openai/dall-e-3"
);
```

### Audio Generation

```typescript
// Text-to-speech
const audio = await client.audio.generateAudio({
   model: "openai/tts-1",
   input: "Hello, this is a test of text to speech.",
   voice: "alloy",
   response_format: "mp3",
});

// Save to file
await client.audio.generateAudioToFile(
   {
      input: "Hello world",
      voice: "alloy",
      model: "openai/tts-1",
   },
   "./output/hello.mp3"
);

// Convenience methods
const audio = await client.audio.textToSpeech(
   "Hello, how are you today?",
   "alloy",
   "openai/tts-1"
);

const audio = await client.audio.textToSpeechWithSpeed(
   "This is a test of speed control.",
   1.5,
   "nova",
   "openai/tts-1"
);
```

### Audio Transcription

```typescript
// Transcribe audio
const transcription = await client.audio.transcribeAudio({
   file: audioBuffer, // Buffer or base64 string
   model: "openai/whisper-1",
   response_format: "verbose_json",
});

// Transcribe from file
const transcription = await client.audio.transcribeFromFile(
   "./audio/recording.mp3",
   "openai/whisper-1"
);
```

### Embeddings

```typescript
// Create embeddings
const embedding = await client.embedding.createEmbedding({
   model: "openai/text-embedding-3-small",
   input: "This is a sample text for embedding.",
});

// Convenience methods
const embedding = await client.embedding.embedText(
   "This is a sample text.",
   "openai/text-embedding-3-small"
);

const embeddings = await client.embedding.embedMultiple(
   ["First text", "Second text", "Third text"],
   "openai/text-embedding-3-small"
);

// Calculate similarity
const similarity = EmbeddingService.cosineSimilarity(embedding1, embedding2);
const distance = EmbeddingService.euclideanDistance(embedding1, embedding2);
```

### Model Information

```typescript
// Get all models
const models = await client.models.getModels();

// Get models by capability
const chatModels = await client.models.getChatModels();
const imageModels = await client.models.getImageModels();
const audioModels = await client.models.getAudioModels();
const embeddingModels = await client.models.getEmbeddingModels();

// Get specific model
const gpt4 = await client.models.getModelById("openai/gpt-4");

// Check model capabilities
const supportsChat = await client.models.supportsCapability(
   "openai/gpt-4",
   "chat"
);

// Search models
const searchResults = await client.models.searchModels("gpt");
```

### Error Handling

```typescript
import { LunosError, APIError, ValidationError } from "@lunos/client";

try {
   const response = await client.chat.createCompletion({
      model: "openai/gpt-4",
      messages: [{ role: "user", content: "Hello" }],
   });
} catch (error) {
   if (error instanceof LunosError) {
      console.error("Lunos API Error:", error.message);
      console.error("Status:", error.status);
      console.error("Code:", error.code);
   } else {
      console.error("Unexpected error:", error);
   }
}
```

### Streaming

```typescript
import { StreamProcessor } from "@lunos/client";

// Process streaming response
const stream = await client.chat.createCompletionStream({
   model: "openai/gpt-4",
   messages: [{ role: "user", content: "Write a story." }],
});

const processor = new StreamProcessor();
await processor.processStream(stream, (chunk) => {
   console.log("Received chunk:", chunk);
});
```

### File Operations

```typescript
import { FileUtils } from "@lunos/client";

// Save buffer to file
await FileUtils.saveBufferToFile(audioBuffer, "./output/audio.mp3");

// Read file as buffer
const buffer = await FileUtils.readFileAsBuffer("./input/image.png");

// Convert file to base64
const base64 = await FileUtils.fileToBase64("./input/audio.wav");

// Convert base64 to buffer
const buffer = FileUtils.base64ToBuffer(base64String);
```

### Client Configuration Methods

```typescript
// Create client with different configuration
const debugClient = client.withDebug();
const timeoutClient = client.withTimeout(60000);
const customHeadersClient = client.withHeaders({
   "X-Custom-Header": "value",
});

// Update configuration
client.updateConfig({
   timeout: 60000,
   debug: true,
});

// Health check
const isHealthy = await client.healthCheck();

// Get usage information
const usage = await client.getUsage();
```

## Advanced Usage

### Custom Fetch Implementation

```typescript
import { fetch } from "node-fetch";

const client = new LunosClient({
   apiKey: "your-api-key",
   fetch: fetch as typeof globalThis.fetch,
});
```

### Retry Configuration

```typescript
const client = new LunosClient({
   apiKey: "your-api-key",
   retries: 5,
   retryDelay: 2000,
});
```

### Request Cancellation

```typescript
const controller = new AbortController();

const response = await client.chat.createCompletion(
   {
      model: "openai/gpt-4",
      messages: [{ role: "user", content: "Hello" }],
   },
   {
      signal: controller.signal,
   }
);

// Cancel the request
controller.abort();
```

### Validation

```typescript
import { ValidationUtils } from "@lunos/client";

// Validate chat request
ValidationUtils.validateChatCompletionRequest({
   messages: [{ role: "user", content: "Hello" }],
});

// Validate image generation
ValidationUtils.validateImageGenerationRequest({
   prompt: "A beautiful landscape",
});
```

## Error Types

-  `LunosError`: Base error class
-  `APIError`: API-specific errors
-  `ValidationError`: Input validation errors
-  `AuthenticationError`: Authentication failures
-  `RateLimitError`: Rate limit exceeded
-  `NetworkError`: Network-related errors

## TypeScript Support

The library is built with TypeScript and provides comprehensive type definitions:

```typescript
import type {
   ChatMessage,
   ChatCompletionRequest,
   ChatCompletionResponse,
   ImageGenerationRequest,
   AudioGenerationRequest,
   EmbeddingRequest,
   Model,
} from "@lunos/client";
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

-  Documentation: [https://lunos.tech/docs](https://lunos.tech/docs)
-  Issues: [GitHub Issues](https://github.com/lunos-tech/client-js/issues)
-  Email: support@lunos.tech

## Changelog

### 1.0.0

-  Initial release
-  Full TypeScript support
-  Chat completions with streaming
-  Image generation
-  Audio generation and transcription
-  Embeddings
-  Model discovery
-  Comprehensive error handling
-  File operations utilities
