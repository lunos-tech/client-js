export interface Model {
   /** Model identifier */
   id: string;
   /** Human-readable model name */
   name: string;
   /** Model parameters (context, max_output_tokens, size) */
   parameters: {
      context: number;
      max_output_tokens: number;
      size: string;
   };
   /** Provider name */
   provider: string;
   /** Pricing per million tokens */
   pricePerMillionTokens: {
      input: number;
      output: number;
   };
   /** Capabilities supported by the model */
   capabilities: string[];
   /** Model status (e.g., available) */
   status: string;
   /** Model description */
   description: string;
}
