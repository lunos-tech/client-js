import { LunosConfig } from "./ClientConfig";

export const DEFAULT_CONFIG: LunosConfig = {
   baseUrl: "https://api.lunos.tech",
   apiKey: "",
   timeout: 30000,
   retries: 3,
   retryDelay: 1000,
   fallback_model: undefined,
   appId: "Unknown",
   debug: false,
};

export function mergeConfig(userConfig: Partial<LunosConfig>): LunosConfig {
   return {
      ...DEFAULT_CONFIG,
      ...userConfig,
   };
}
