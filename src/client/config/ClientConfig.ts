export interface LunosConfig {
   /** Base URL for the Lunos API */
   baseUrl: string;
   /** API key for authentication */
   apiKey: string;
   /** Request timeout in milliseconds */
   timeout: number;
   /** Number of retry attempts */
   retries: number;
   /** Delay between retries in milliseconds */
   retryDelay: number;
   /** Fallback model to use when primary model fails after retries */
   fallback_model?: string;
   /** Custom headers to include in all requests */
   headers?: Record<string, string>;
   /** Whether to enable debug logging */
   debug?: boolean;
   /** Custom fetch implementation */
   fetch?: typeof fetch;
}

export interface RequestOptions {
   /** Request timeout override */
   timeout?: number;
   /** Custom headers for this request */
   headers?: Record<string, string>;
   /** Whether to retry on failure */
   retry?: boolean;
   /** Signal for request cancellation */
   signal?: AbortSignal;
   /** Fallback model for this specific request */
   fallback_model?: string;
}
