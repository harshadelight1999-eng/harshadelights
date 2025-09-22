export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: any) => boolean;
}

export class RetryManager {
  private options: RetryOptions;

  constructor(options: Partial<RetryOptions> = {}) {
    this.options = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      ...options
    };
  }

  /**
   * Execute a function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Check if we should retry this error
        if (this.options.retryCondition && !this.options.retryCondition(error)) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === this.options.maxRetries) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.options.baseDelay * Math.pow(this.options.backoffFactor, attempt),
          this.options.maxDelay
        );
        
        console.warn(`${context} failed (attempt ${attempt + 1}/${this.options.maxRetries + 1}), retrying in ${delay}ms:`, error);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Default retry condition for network errors
   */
  static isRetryableError(error: any): boolean {
    if (!error) return false;
    
    // Retry on network errors
    if (error.code === 'ECONNRESET' || 
        error.code === 'ENOTFOUND' || 
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT') {
      return true;
    }
    
    // Retry on HTTP 5xx errors
    if (error.response && error.response.status >= 500) {
      return true;
    }
    
    // Retry on HTTP 429 (rate limit)
    if (error.response && error.response.status === 429) {
      return true;
    }
    
    return false;
  }

  /**
   * Create a retry manager for API calls
   */
  static forApiCalls(): RetryManager {
    return new RetryManager({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      retryCondition: RetryManager.isRetryableError
    });
  }

  /**
   * Create a retry manager for database operations
   */
  static forDatabaseOps(): RetryManager {
    return new RetryManager({
      maxRetries: 5,
      baseDelay: 500,
      maxDelay: 5000,
      backoffFactor: 1.5,
      retryCondition: (error) => {
        // Retry on connection errors
        return error.code === 'ECONNRESET' || 
               error.code === 'ECONNREFUSED' ||
               error.message?.includes('connection');
      }
    });
  }
}
