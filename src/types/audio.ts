import { BaseRequest } from "./common";

export interface AudioGenerationRequest extends BaseRequest {
   /** Text input for speech synthesis */
   input: string;
   /** Voice to use for synthesis */
   voice?: string;
   /** Response format */
   response_format?: "mp3" | "opus" | "aac" | "flac";
   /** Speed of speech (0.25 to 4.0) */
   speed?: number;
   /** User identifier */
   user?: string;
}

export interface AudioGenerationResponse {
   /** Audio data as buffer */
   audioBuffer: Buffer;
   /** Content type of the audio */
   contentType: string;
   /** Suggested filename */
   filename: string;
   /** Duration in seconds (if available) */
   duration?: number;
}

export interface AudioTranscriptionRequest {
   /** Audio file to transcribe */
   file: Buffer | string;
   /** Model to use for transcription */
   model?: string;
   /** Language of the audio */
   language?: string;
   /** Response format */
   response_format?: "json" | "text" | "srt" | "verbose_json" | "vtt";
   /** Temperature for sampling */
   temperature?: number;
   /** Timestamp granularities */
   timestamp_granularities?: ("word" | "segment")[];
   /** Prompt for transcription */
   prompt?: string;
   /** User identifier */
   user?: string;
}

export interface AudioTranscriptionResponse {
   /** Transcribed text */
   text: string;
   /** Language detected */
   language?: string;
   /** Duration in seconds */
   duration?: number;
   /** Segments with timestamps (if verbose) */
   segments?: Array<{
      /** Segment ID */
      id: number;
      /** Start time in seconds */
      start: number;
      /** End time in seconds */
      end: number;
      /** Transcribed text */
      text: string;
      /** Confidence score */
      avg_logprob?: number;
      /** Compression ratio */
      compression_ratio?: number;
      /** No speech probability */
      no_speech_prob?: number;
      /** Words with timestamps */
      words?: Array<{
         /** Word text */
         word: string;
         /** Start time in seconds */
         start: number;
         /** End time in seconds */
         end: number;
      }>;
   }>;
}
