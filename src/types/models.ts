export interface Model {
   /** Model identifier */
   id: string;
   /** Model object type */
   object: "model";
   /** Creation timestamp */
   created: number;
   /** Model owner */
   owned_by: string;
   /** Model permissions */
   permission: Array<{
      /** Permission ID */
      id: string;
      /** Permission object type */
      object: "model_permission";
      /** Creation timestamp */
      created: number;
      /** Whether permission is allowed */
      allow_create_engine: boolean;
      /** Whether to allow sampling */
      allow_sampling: boolean;
      /** Whether to allow logprobs */
      allow_logprobs: boolean;
      /** Whether to allow search indices */
      allow_search_indices: boolean;
      /** Whether to allow view */
      allow_view: boolean;
      /** Whether to allow fine-tuning */
      allow_fine_tuning: boolean;
      /** Organization */
      organization: string;
      /** Group */
      group?: string;
      /** Whether permission is blocking */
      is_blocking: boolean;
   }>;
   /** Model root */
   root?: string;
   /** Model parent */
   parent?: string;
   /** Model capabilities */
   capabilities?: string[];
   /** Model context length */
   context_length?: number;
   /** Model description */
   description?: string;
   /** Model pricing */
   pricing?: {
      /** Input price per 1K tokens */
      input: number;
      /** Output price per 1K tokens */
      output: number;
   };
}

export interface ModelCapability {
   /** Capability name */
   name: string;
   /** Capability description */
   description: string;
   /** Whether capability is supported */
   supported: boolean;
}

export interface ModelCategory {
   /** Category name */
   name: string;
   /** Category description */
   description: string;
   /** Models in this category */
   models: Model[];
}
