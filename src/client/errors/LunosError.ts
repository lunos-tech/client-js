export class LunosError extends Error {
   public status: number;
   public code?: string;
   public details?: any;

   constructor(
      message: string,
      status: number = 0,
      code?: string,
      details?: any
   ) {
      super(message);
      this.name = "LunosError";
      this.status = status;
      this.code = code;
      this.details = details;
   }
}

export class APIError extends LunosError {
   constructor(message: string, status: number, code?: string, details?: any) {
      super(message, status, code, details);
      this.name = "APIError";
   }
}

export class ValidationError extends LunosError {
   constructor(message: string, details?: any) {
      super(message, 400, "VALIDATION_ERROR", details);
      this.name = "ValidationError";
   }
}

export class AuthenticationError extends LunosError {
   constructor(message: string = "Authentication failed") {
      super(message, 401, "AUTHENTICATION_ERROR");
      this.name = "AuthenticationError";
   }
}

export class RateLimitError extends LunosError {
   constructor(message: string = "Rate limit exceeded", retryAfter?: number) {
      super(message, 429, "RATE_LIMIT_ERROR", { retryAfter });
      this.name = "RateLimitError";
   }
}

export class NetworkError extends LunosError {
   constructor(message: string = "Network error occurred") {
      super(message, 0, "NETWORK_ERROR");
      this.name = "NetworkError";
   }
}
