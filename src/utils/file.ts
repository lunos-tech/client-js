import * as fs from "fs";
import * as path from "path";

export class FileUtils {
   /**
    * Saves a buffer to a file
    */
   static async saveBufferToFile(
      buffer: Buffer,
      filepath: string
   ): Promise<void> {
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
         fs.mkdirSync(dir, { recursive: true });
      }

      return new Promise((resolve, reject) => {
         fs.writeFile(filepath, buffer, (err) => {
            if (err) reject(err);
            else resolve();
         });
      });
   }

   /**
    * Reads a file as a buffer
    */
   static async readFileAsBuffer(filepath: string): Promise<Buffer> {
      return new Promise((resolve, reject) => {
         fs.readFile(filepath, (err, data) => {
            if (err) reject(err);
            else resolve(data);
         });
      });
   }

   /**
    * Gets the file extension from a filepath
    */
   static getFileExtension(filepath: string): string {
      return path.extname(filepath).slice(1);
   }

   /**
    * Checks if a file exists
    */
   static async fileExists(filepath: string): Promise<boolean> {
      return new Promise((resolve) => {
         fs.access(filepath, fs.constants.F_OK, (err) => {
            resolve(!err);
         });
      });
   }

   /**
    * Gets file size in bytes
    */
   static async getFileSize(filepath: string): Promise<number> {
      return new Promise((resolve, reject) => {
         fs.stat(filepath, (err, stats) => {
            if (err) reject(err);
            else resolve(stats.size);
         });
      });
   }

   /**
    * Creates a directory if it doesn't exist
    */
   static async ensureDirectoryExists(dirpath: string): Promise<void> {
      return new Promise((resolve, reject) => {
         fs.mkdir(dirpath, { recursive: true }, (err) => {
            if (err) reject(err);
            else resolve();
         });
      });
   }

   /**
    * Converts a file to base64 string
    */
   static async fileToBase64(filepath: string): Promise<string> {
      const buffer = await this.readFileAsBuffer(filepath);
      return buffer.toString("base64");
   }

   /**
    * Converts base64 string to buffer
    */
   static base64ToBuffer(base64: string): Buffer {
      return Buffer.from(base64, "base64");
   }

   /**
    * Gets MIME type from file extension
    */
   static getMimeType(filepath: string): string {
      const ext = this.getFileExtension(filepath).toLowerCase();
      const mimeTypes: Record<string, string> = {
         jpg: "image/jpeg",
         jpeg: "image/jpeg",
         png: "image/png",
         gif: "image/gif",
         webp: "image/webp",
         mp3: "audio/mpeg",
         wav: "audio/wav",
         ogg: "audio/ogg",
         mp4: "video/mp4",
         avi: "video/x-msvideo",
         pdf: "application/pdf",
         txt: "text/plain",
         json: "application/json",
      };
      return mimeTypes[ext] || "application/octet-stream";
   }
}
