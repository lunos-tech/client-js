import { BaseService } from "./base/BaseService";
import {
   AudioGenerationRequest,
   AudioGenerationResponse,
} from "../types/audio";
import { ValidationUtils } from "../utils/validation";
import { FileUtils } from "../utils/file";
// @ts-ignore: No type definitions for 'wav-encoder'. Add @types/wav-encoder if available.
import WavEncoder from "wav-encoder";
import * as fs from "fs";

/**
 * Service for handling audio generation and transcription operations.
 * Provides both low-level API methods and high-level convenience methods
 * for common audio processing tasks including text-to-speech and speech-to-text.
 */
export class AudioService extends BaseService {
   /**
    * Generates audio from text input using the Lunos AI API.
    *
    * This method handles the core audio generation functionality, validating
    * the request parameters and making the API call to generate audio from text.
    * The response includes the audio buffer, content type, and suggested filename.
    *
    * @param request - Complete audio generation request object containing
    *                  input text, voice, format, speed, and other parameters
    * @returns Promise resolving to AudioGenerationResponse with audio buffer and metadata
    * @throws Error if request validation fails or API call fails
    *
    * @example
    * ```typescript
    * const response = await client.audio.generateAudio({
    *   input: "Hello, this is a test of text to speech.",
    *   voice: "alloy",
    *   model: "openai/tts",
    *   response_format: "mp3",
    *   speed: 1.0,
    *   appId: "my-app"
    * });
    * ```
    */
   async generateAudio(
      request: AudioGenerationRequest
   ): Promise<AudioGenerationResponse> {
      ValidationUtils.validateAudioGenerationRequest(request);
      this.log("Generating audio", {
         input: request.input.substring(0, 50) + "...",
         voice: request.voice,
         appId: request.appId,
      });

      // Always use makeRawRequest for audio
      const { buffer, contentType } = await this.makeRawRequest(
         "/v1/audio/generations",
         {
            method: "POST",
            body: JSON.stringify(request),
         },
         {
            appId: request.appId,
         }
      );

      return {
         audioBuffer: buffer,
         contentType,
         filename: `audio_${Date.now()}.${this.getFileExtension(contentType)}`,
      };
   }

   /**
    * Generates audio and saves it directly to a file.
    *
    * This method combines audio generation with file saving, providing
    * a convenient way to generate and store audio files in one operation.
    *
    * @param request - Audio generation request object
    * @param filepath - Path where the audio file should be saved
    * @returns Promise resolving to the filepath where the audio was saved
    * @throws Error if audio generation fails or file saving fails
    *
    * @example
    * ```typescript
    * const filepath = await client.audio.generateAudioToFile({
    *   input: "Welcome to our application!",
    *   voice: "nova",
    *   model: "openai/tts"
    * }, "./output/audio.mp3");
    * ```
    */
   async generateAudioToFile(
      request: AudioGenerationRequest,
      filepath: string
   ): Promise<string> {
      const result = await this.generateAudio(request);
      await FileUtils.saveBufferToFile(result.audioBuffer, filepath);
      return filepath;
   }

   /**
    * Convenience method for text-to-speech with structured parameters.
    *
    * This method provides a simplified interface for text-to-speech using
    * a structured object that separates the text input from other options.
    *
    * @param options - Object containing text input and optional generation parameters
    * @returns Promise resolving to AudioGenerationResponse with generated audio
    *
    * @example
    * ```typescript
    * const response = await client.audio.textToSpeech({
    *   text: "Hello from Lunos AI! This is a test of text to speech.",
    *   voice: "alloy",
    *   model: "openai/tts",
    *   response_format: "mp3",
    *   speed: 1.0,
    *   appId: "my-app"
    * });
    * ```
    */
   async textToSpeech(options: {
      text: string;
      voice?: string;
      model?: string;
      response_format?: "mp3" | "opus" | "aac" | "flac";
      speed?: number;
      user?: string;
      appId?: string;
   }): Promise<AudioGenerationResponse> {
      return this.generateAudio({
         input: options.text,
         voice: options.voice,
         model: options.model,
         response_format: options.response_format,
         speed: options.speed,
         user: options.user,
         appId: options.appId,
      });
   }

   /**
    * Convenience method for text-to-speech with specific format.
    *
    * This method automatically sets the response format while maintaining
    * the structured parameter approach.
    *
    * @param options - Object containing text input, format, and other parameters
    * @returns Promise resolving to AudioGenerationResponse with audio in specified format
    *
    * @example
    * ```typescript
    * const response = await client.audio.textToSpeechWithFormat({
    *   text: "This is a high-quality audio sample.",
    *   format: "flac",
    *   voice: "echo",
    *   model: "openai/tts",
    *   appId: "my-app"
    * });
    * ```
    */
   async textToSpeechWithFormat(options: {
      text: string;
      format: "mp3" | "opus" | "aac" | "flac";
      voice?: string;
      model?: string;
      speed?: number;
      user?: string;
      appId?: string;
   }): Promise<AudioGenerationResponse> {
      return this.generateAudio({
         input: options.text,
         voice: options.voice,
         model: options.model,
         response_format: options.format,
         speed: options.speed,
         user: options.user,
         appId: options.appId,
      });
   }

   /**
    * Convenience method for text-to-speech with speed control.
    *
    * This method allows for speed adjustment while maintaining
    * the structured parameter approach.
    *
    * @param options - Object containing text input, speed, and other parameters
    * @returns Promise resolving to AudioGenerationResponse with speed-adjusted audio
    * @throws Error if speed is not between 0.25 and 4.0
    *
    * @example
    * ```typescript
    * const response = await client.audio.textToSpeechWithSpeed({
    *   text: "This is a slow speech sample.",
    *   speed: 0.5,
    *   voice: "fable",
    *   model: "openai/tts",
    *   appId: "my-app"
    * });
    * ```
    */
   async textToSpeechWithSpeed(options: {
      text: string;
      speed: number;
      voice?: string;
      model?: string;
      response_format?: "mp3" | "opus" | "aac" | "flac";
      user?: string;
      appId?: string;
   }): Promise<AudioGenerationResponse> {
      if (options.speed < 0.25 || options.speed > 4.0) {
         throw new Error("Speed must be between 0.25 and 4.0");
      }

      return this.generateAudio({
         input: options.text,
         voice: options.voice,
         model: options.model,
         speed: options.speed,
         response_format: options.response_format,
         user: options.user,
         appId: options.appId,
      });
   }

   /**
    * Gets the file extension for a content type.
    *
    * This private method maps MIME content types to their corresponding
    * file extensions for proper file naming.
    *
    * @param contentType - MIME content type string
    * @returns File extension string
    *
    * @example
    * ```typescript
    * const extension = this.getFileExtension("audio/mpeg"); // Returns "mp3"
    * ```
    */
   private getFileExtension(contentType: string): string {
      const mapping: Record<string, string> = {
         "audio/mpeg": "mp3",
         "audio/wav": "wav",
         "audio/ogg": "ogg",
         "audio/webm": "webm",
         "audio/aac": "aac",
         "audio/flac": "flac",
      };
      return mapping[contentType] || "mp3";
   }

   /**
    * Validates audio generation parameters for correctness.
    *
    * This static method performs validation on audio generation parameters
    * to ensure they meet the API requirements before making requests.
    *
    * @param text - Text input for speech synthesis
    * @param voice - Optional voice identifier
    * @param speed - Optional speed multiplier
    * @throws Error if parameters are invalid
    *
    * @example
    * ```typescript
    * AudioService.validateAudioGenerationParams(
    *   "Hello world",
    *   "alloy",
    *   1.0
    * );
    * ```
    */
   static validateAudioGenerationParams(
      text: string,
      voice?: string,
      speed?: number
   ): void {
      if (!text || typeof text !== "string" || text.trim().length === 0) {
         throw new Error("Text input is required and cannot be empty");
      }

      if (text.length > 4096) {
         throw new Error("Text input cannot exceed 4096 characters");
      }

      if (
         voice &&
         !["alloy", "echo", "fable", "onyx", "nova", "shimmer"].includes(voice)
      ) {
         throw new Error(
            "Invalid voice. Must be one of: alloy, echo, fable, onyx, nova, shimmer"
         );
      }

      if (speed !== undefined && (speed < 0.25 || speed > 4.0)) {
         throw new Error("Speed must be between 0.25 and 4.0");
      }
   }

   /**
    * Helper to save any audio buffer to a file
    */
   static async saveAudioToFile(
      audioBuffer: Buffer,
      filepath: string
   ): Promise<void> {
      await fs.promises.writeFile(filepath, audioBuffer);
   }

   /**
    * Helper to convert PCM buffer to WAV file using wav-encoder (mono, 24kHz, 16-bit signed)
    * @param pcmBuffer - PCM audio buffer
    * @param wavFilePath - Output WAV file path
    * @param sampleRate - Sample rate (default 24000)
    */
   static async convertPCMToWav(
      pcmBuffer: Buffer,
      wavFilePath: string,
      sampleRate: number = 24000
   ): Promise<void> {
      // Convert PCM (s16le) to Float32Array
      const int16Array = new Int16Array(
         pcmBuffer.buffer,
         pcmBuffer.byteOffset,
         pcmBuffer.length / 2
      );
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
         float32Array[i] = int16Array[i] / 32768;
      }
      // Prepare audio data for wav-encoder
      const audioData = {
         sampleRate: sampleRate,
         channelData: [float32Array], // mono
      };
      // Encode and write WAV file
      const wavBuffer = await WavEncoder.encode(audioData);
      await fs.promises.writeFile(wavFilePath, Buffer.from(wavBuffer));
   }
}
