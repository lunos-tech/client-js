# Lunos AI Client Library Examples

This directory contains comprehensive examples demonstrating how to use the Lunos AI client library.

## Example Files

### 📋 `basic-usage.ts`

A simple overview of all services with quick examples. Perfect for getting started.

**What it demonstrates:**

-  Basic chat completion
-  Simple image generation
-  Text-to-speech generation
-  Text embedding
-  Model information

### 💬 `chat-examples.ts`

Comprehensive chat completion examples including streaming and fallback models.

**What it demonstrates:**

-  Basic chat completions
-  Streaming responses with callbacks
-  Fallback model handling
-  Different conversation patterns
-  Structured parameter usage

### 🎨 `image-examples.ts`

Complete image generation examples with various options and formats.

**What it demonstrates:**

-  Basic image generation
-  High-quality (HD) generation
-  Custom dimensions
-  Multiple image generation
-  Different response formats (URL, Base64)
-  Various styles (vivid, natural)
-  Different sizes

### 🎵 `audio-examples.ts`

Text-to-speech and audio transcription examples.

**What it demonstrates:**

-  Basic text-to-speech
-  Different voices (alloy, echo, fable, onyx, nova, shimmer)
-  Various audio formats (mp3, opus, aac, flac)
-  Speed control
-  Long text handling
-  File saving
-  Audio transcription (conceptual)

### 🔢 `embedding-examples.ts`

Text embedding and similarity calculation examples.

**What it demonstrates:**

-  Single text embedding
-  Multiple text embedding
-  Different encoding formats (float, base64)
-  Custom dimensions
-  Cosine similarity calculations
-  Euclidean distance
-  Finding most similar embeddings
-  Batch processing

### 🤖 `model-examples.ts`

Model discovery and information examples.

**What it demonstrates:**

-  Getting all available models
-  Filtering by capabilities
-  Model search
-  Model information and pricing (using new fields: name, parameters, provider, pricePerMillionTokens, capabilities, status, description)
-  Capability checking

**Model Object Structure:**

Model objects now have the following structure:

```
{
  "id": "deepseek/deepseek-r1-0528",
  "name": "DeepSeek R1-0528",
  "parameters": {
    "context": 163840,
    "max_output_tokens": 163840,
    "size": "671B"
  },
  "provider": "deepseek",
  "pricePerMillionTokens": {
    "input": 0.45,
    "output": 1.9
  },
  "capabilities": ["text-generation"],
  "status": "available",
  "description": "..."
}
```

See the updated `model-examples.ts` for usage.

## Running Examples

### Prerequisites

1. Set your API key as an environment variable:

   ```bash
   export LUNOS_API_KEY="your-api-key-here"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Individual Examples

```bash
# Basic overview
npm run example:basic

# Chat examples
npm run example:chat

# Image examples
npm run example:image

# Audio examples
npm run example:audio

# Embedding examples
npm run example:embedding

# Model examples
npm run example:model
```

### Running All Examples

```bash
# Run all examples sequentially
npm run examples:all
```

## Example Structure

Each example file follows a consistent structure:

1. **Import and Setup**: Import the client and initialize with API key
2. **Service Overview**: Brief description of what the service does
3. **Progressive Examples**: From basic to advanced usage
4. **Error Handling**: Proper error handling and logging
5. **Documentation**: Clear comments explaining each example

## Key Features Demonstrated

### Structured Parameters

All examples use the new structured parameter approach:

```typescript
// Old approach (deprecated)
const response = await client.image.generate("A cute robot", "openai/dall-e-3");

// New structured approach
const response = await client.image.generate({
   prompt: "A cute robot",
   model: "openai/dall-e-3",
   size: "1024x1024",
   quality: "hd",
});
```

### Comprehensive Documentation

Each function includes detailed JSDoc comments with:

-  Function description
-  Parameter explanations
-  Return value details
-  Usage examples
-  Error conditions

### Error Handling

Examples demonstrate proper error handling:

-  Try-catch blocks
-  Graceful degradation
-  Informative error messages
-  Fallback strategies

## Contributing

When adding new examples:

1. Follow the existing structure and naming conventions
2. Include comprehensive comments
3. Demonstrate both basic and advanced usage
4. Show error handling patterns
5. Use the structured parameter approach
6. Update this README if adding new example files

## Notes

-  Examples use the default API key for demonstration purposes
-  Some examples may require specific models to be available
-  Audio transcription examples are conceptual (require actual audio files)
-  File saving examples may require appropriate directory permissions
