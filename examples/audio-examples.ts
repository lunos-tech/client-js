import { LunosClient } from "../src/index";
import { AudioService } from "../src/services/AudioService";
import * as path from "path";

/**
 * Audio Service Usage Examples
 *
 * This file showcases how to use the Lunos audio API for:
 * - Generating speech from text (text-to-speech)
 * - Selecting different voices and output formats
 * - Adjusting speech speed
 * - Transcribing audio to text
 * - Saving and handling audio files
 * - Converting PCM audio data to WAV format
 */

async function audioExamples() {
   const client = new LunosClient({
      apiKey:
         process.env.LUNOS_API_KEY ||
         "sk-694f5c2bfc72921c7fd3628d69ed2ea7d4bb6c1aadd4e608",
   });

   console.log("🎵 Audio Service Examples");
   console.log("=========================\n");

   try {
      // --- A. OpenAI MP3 Example (No File Save) ---
      console.log("A. OpenAI TTS (MP3) - No File Save");
      const mp3ResponseNoSave = await client.audio.textToSpeech({
         text: "Hello from Lunos AI! This is an MP3 test (no file save).",
         voice: "alloy",
         model: "openai/tts",
         response_format: "mp3",
         speed: 1.0,
      });
      console.log(`   Buffer length: ${mp3ResponseNoSave.audioBuffer.length}`);
      console.log(`   Content type: ${mp3ResponseNoSave.contentType}`);
      console.log(
         `   Buffer preview:`,
         mp3ResponseNoSave.audioBuffer.subarray(0, 16)
      );
      console.log("");

      // --- B. Google PCM Example (No File Save) ---
      // Replace 'google/gemini-2.5-flash-preview-tts' with your actual Google TTS model ID if needed
      try {
         console.log("B. Google TTS (PCM) - No File Save");
         const googlePcmResponseNoSave = await client.audio.textToSpeech({
            text: "This is a PCM test from Google TTS (no file save).",
            voice: "Zephyr",
            model: "google/gemini-2.5-flash-preview-tts",
            response_format: "pcm" as any,
            speed: 1.0,
         });
         console.log(
            `   Buffer length: ${googlePcmResponseNoSave.audioBuffer.length}`
         );
         console.log(`   Content type: ${googlePcmResponseNoSave.contentType}`);
         console.log(
            `   Buffer preview:`,
            googlePcmResponseNoSave.audioBuffer.subarray(0, 16)
         );
         console.log("");
      } catch (err) {
         console.log(err);
         console.log(
            "   Google TTS PCM (no file save) skipped (model may not be available)"
         );
      }

      // --- 1. OpenAI MP3 Example ---
      console.log("1. OpenAI TTS (MP3)");
      const mp3Response = await client.audio.textToSpeech({
         text: "Hello from Lunos AI! This is an MP3 test.",
         voice: "alloy",
         model: "openai/tts",
         response_format: "mp3",
         speed: 1.0,
      });
      const mp3Path = path.resolve("./output/openai-tts-test.mp3");
      await AudioService.saveAudioToFile(mp3Response.audioBuffer, mp3Path);
      console.log(`   Saved OpenAI MP3 to: ${mp3Path}`);
      console.log(`   Content type: ${mp3Response.contentType}`);
      console.log("");

      // // --- 2. OpenAI PCM Example + WAV Conversion ---
      console.log("2. OpenAI TTS (PCM) and Convert to WAV");
      const pcmResponse = await client.audio.textToSpeech({
         text: "This is a PCM test from OpenAI.",
         voice: "alloy",
         model: "openai/tts",
         response_format: "pcm" as any,
         speed: 1.0,
      });
      const pcmPath = path.resolve("./output/openai-tts-test.pcm");
      await AudioService.saveAudioToFile(pcmResponse.audioBuffer, pcmPath);
      console.log(`   Saved OpenAI PCM to: ${pcmPath}`);
      const wavPath = path.resolve("./output/openai-tts-test.wav");
      await AudioService.convertPCMToWav(
         pcmResponse.audioBuffer,
         wavPath,
         24000
      );
      console.log(`   Converted PCM to WAV: ${wavPath}`);
      console.log("");

      // --- 3. Google PCM Example + WAV Conversion ---
      // (Assuming you have a Google TTS model available)
      // Replace 'gemini-2.5-flash-preview-tts' with your actual Google TTS model ID
      try {
         console.log("3. Google TTS (PCM) and Convert to WAV");
         const googlePcmResponse = await client.audio.textToSpeech({
            text: "This is a PCM test from Google TTS.",
            voice: "Zephyr",
            model: "google/gemini-2.5-flash-preview-tts",
            response_format: "pcm" as any,
            speed: 1.0,
         });
         const googlePcmPath = path.resolve("./output/google-tts-test.pcm");
         await AudioService.saveAudioToFile(
            googlePcmResponse.audioBuffer,
            googlePcmPath
         );
         console.log(`   Saved Google PCM to: ${googlePcmPath}`);
         const googleWavPath = path.resolve("./output/google-tts-test.wav");
         await AudioService.convertPCMToWav(
            googlePcmResponse.audioBuffer,
            googleWavPath,
            24000
         );
         console.log(`   Converted Google PCM to WAV: ${googleWavPath}`);
         console.log("");
      } catch (err) {
         console.log(err);
         console.log(
            "   Google TTS PCM test skipped (model may not be available)"
         );
      }

      // --- 4. Other formats and voices (optional) ---
      // ... (existing examples)

      console.log("✅ Audio examples completed successfully!");
   } catch (error) {
      console.error("❌ Error during audio examples:", error);
      process.exit(1);
   }
}

// Run the examples
if (require.main === module) {
   audioExamples().catch(console.error);
}
