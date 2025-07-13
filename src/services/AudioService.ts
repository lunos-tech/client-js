import { BaseService } from "./base/BaseService";
import {
   AudioGenerationRequest,
   AudioGenerationResponse,
   AudioTranscriptionRequest,
   AudioTranscriptionResponse,
} from "../types/audio";
import { ValidationUtils } from "../utils/validation";
import { FileUtils } from "../utils/file";

export class AudioService extends BaseService {
   /**
    * Generates audio from text input
    */
   async generateAudio(
      request: AudioGenerationRequest
   ): Promise<AudioGenerationResponse> {
      ValidationUtils.validateAudioGenerationRequest(request);
      this.log("Generating audio", {
         input: request.input.substring(0, 50) + "...",
         voice: request.voice,
      });

      const response = await this.makeRequest<{
         audioData: string;
         contentType: string;
      }>("/v1/audio/generations", {
         method: "POST",
         body: JSON.stringify(request),
      });

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(response.audioData, "base64");

      return {
         audioBuffer,
         contentType: response.contentType,
         filename: `audio_${Date.now()}.${this.getFileExtension(
            response.contentType
         )}`,
      };
   }

   /**
    * Generates audio and saves it to a file
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
    * Transcribes audio to text
    */
   async transcribeAudio(
      request: AudioTranscriptionRequest
   ): Promise<AudioTranscriptionResponse> {
      if (!request.file) {
         throw new Error("Audio file is required for transcription");
      }

      this.log("Transcribing audio", { model: request.model });

      // Convert file to base64 if it's a buffer
      let audioData: string;
      if (Buffer.isBuffer(request.file)) {
         audioData = request.file.toString("base64");
      } else {
         audioData = request.file;
      }

      const response = await this.makeRequest<AudioTranscriptionResponse>(
         "/v1/audio/transcriptions",
         {
            method: "POST",
            body: JSON.stringify({
               ...request,
               file: audioData,
            }),
         }
      );

      return response;
   }

   /**
    * Convenience method for text-to-speech
    */
   async textToSpeech(
      text: string,
      voice?: string,
      model?: string,
      options?: Partial<AudioGenerationRequest>
   ): Promise<AudioGenerationResponse> {
      return this.generateAudio({
         input: text,
         voice,
         model,
         ...options,
      });
   }

   /**
    * Convenience method for text-to-speech with specific format
    */
   async textToSpeechWithFormat(
      text: string,
      format: "mp3" | "opus" | "aac" | "flac",
      voice?: string,
      model?: string,
      options?: Partial<AudioGenerationRequest>
   ): Promise<AudioGenerationResponse> {
      return this.generateAudio({
         input: text,
         voice,
         model,
         response_format: format,
         ...options,
      });
   }

   /**
    * Convenience method for text-to-speech with speed control
    */
   async textToSpeechWithSpeed(
      text: string,
      speed: number,
      voice?: string,
      model?: string,
      options?: Partial<AudioGenerationRequest>
   ): Promise<AudioGenerationResponse> {
      if (speed < 0.25 || speed > 4.0) {
         throw new Error("Speed must be between 0.25 and 4.0");
      }

      return this.generateAudio({
         input: text,
         voice,
         model,
         speed,
         ...options,
      });
   }

   /**
    * Transcribes audio from a file path
    */
   async transcribeFromFile(
      filepath: string,
      model?: string,
      options?: Partial<AudioTranscriptionRequest>
   ): Promise<AudioTranscriptionResponse> {
      const audioBuffer = await FileUtils.readFileAsBuffer(filepath);
      return this.transcribeAudio({
         file: audioBuffer,
         model,
         ...options,
      });
   }

   /**
    * Transcribes audio with specific response format
    */
   async transcribeWithFormat(
      file: Buffer | string,
      format: "json" | "text" | "srt" | "verbose_json" | "vtt",
      model?: string,
      options?: Partial<AudioTranscriptionRequest>
   ): Promise<AudioTranscriptionResponse> {
      return this.transcribeAudio({
         file,
         model,
         response_format: format,
         ...options,
      });
   }

   /**
    * Gets the file extension for a content type
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
    * Validates audio generation parameters
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
}
