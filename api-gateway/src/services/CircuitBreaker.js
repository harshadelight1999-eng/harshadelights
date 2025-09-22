/**
 * Circuit Breaker Implementation for API Gateway
 * Implements the Circuit Breaker pattern for service resilience
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 60000; // 1 minute
    this.expectedErrorThreshold = options.expectedErrorThreshold || 50; // 50%

    // Circuit states
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;

    // Monitoring window
    this.monitoringWindow = [];
    this.windowStartTime = Date.now();

    // Event listeners
    this.listeners = {
      stateChange: [],
      failure: [],
      success: [],
      timeout: []
    };

    logger.info(`🔧 Circuit breaker initialized: threshold=${this.failureThreshold}, timeout=${this.recoveryTimeout}ms`);
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Function to execute
   * @param {...any} args - Arguments to pass to the function
   * @returns {Promise} Function result or circuit breaker error
   */
  async execute(fn, ...args) {
    if (this.isOpen()) {
      if (this.canAttemptReset()) {
        this.setState('HALF_OPEN');
      } else {
        const error = new Error('Circuit breaker is OPEN');
        error.code = 'CIRCUIT_BREAKER_OPEN';
        error.nextAttemptTime = this.nextAttemptTime;
        throw error;
      }
    }

    try {
      const result = await fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Record a successful operation
   */
  onSuccess() {
    this.successCount++;
    this.addToMonitoringWindow('success');

    if (this.state === 'HALF_OPEN') {
      this.reset();
    }

    this.emit('success', {
      state: this.state,
      successCount: this.successCount,
      failureCount: this.failureCount
    });
  }

  /**
   * Record a failed operation
   * @param {Error} error - The error that occurred
   */
  onFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.addToMonitoringWindow('failure');

    if (this.state === 'HALF_OPEN') {
      this.open();
    } else if (this.shouldOpen()) {
      this.open();
    }

    this.emit('failure', {
      state: this.state,
      error: error,
      failureCount: this.failureCount,
      threshold: this.failureThreshold
    });
  }

  /**
   * Manually record success (for external monitoring)
   */
  recordSuccess() {
    this.onSuccess();
  }

  /**
   * Manually record failure (for external monitoring)
   */
  recordFailure(error = null) {
    this.onFailure(error || new Error('External failure recorded'));
  }

  /**
   * Check if circuit should open
   */
  shouldOpen() {
    // Check failure count threshold
    if (this.failureCount >= this.failureThreshold) {
      return true;
    }

    // Check failure rate in monitoring window
    const recentEvents = this.getRecentEvents();
    if (recentEvents.length >= 10) { // Minimum events for statistical significance
      const failures = recentEvents.filter(event => event.type === 'failure').length;
      const failureRate = (failures / recentEvents.length) * 100;

      if (failureRate >= this.expectedErrorThreshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Open the circuit breaker
   */
  open() {
    this.setState('OPEN');
    this.nextAttemptTime = Date.now() + this.recoveryTimeout;

    // Schedule automatic half-open attempt
    setTimeout(() => {
      if (this.state === 'OPEN') {
        this.setState('HALF_OPEN');
      }
    }, this.recoveryTimeout);

    logger.warn(`🔴 Circuit breaker OPENED: failures=${this.failureCount}, threshold=${this.failureThreshold}`);
  }

  /**
   * Close the circuit breaker (reset)
   */
  reset() {
    this.setState('CLOSED');
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;

    logger.info(`🟢 Circuit breaker CLOSED (reset): state restored to normal`);
  }

  /**
   * Check if circuit breaker is open
   */
  isOpen() {
    return this.state === 'OPEN';
  }

  /**
   * Check if circuit breaker is half-open
   */
  isHalfOpen() {
    return this.state === 'HALF_OPEN';
  }

  /**
   * Check if circuit breaker is closed
   */
  isClosed() {
    return this.state === 'CLOSED';
  }

  /**
   * Check if we can attempt to reset the circuit
   */
  canAttemptReset() {
    return this.nextAttemptTime && Date.now() >= this.nextAttemptTime;
  }

  /**
   * Set circuit breaker state
   */
  setState(newState) {
    const oldState = this.state;
    this.state = newState;

    if (oldState !== newState) {
      this.emit('stateChange', {
        oldState,
        newState,
        timestamp: new Date(),
        failureCount: this.failureCount,
        successCount: this.successCount
      });
    }
  }

  /**
   * Add event to monitoring window
   */
  addToMonitoringWindow(type) {
    const now = Date.now();
    const event = { type, timestamp: now };

    this.monitoringWindow.push(event);

    // Clean old events outside monitoring period
    this.monitoringWindow = this.monitoringWindow.filter(
      event => now - event.timestamp <= this.monitoringPeriod
    );
  }

  /**
   * Get recent events from monitoring window
   */
  getRecentEvents() {
    const now = Date.now();
    return this.monitoringWindow.filter(
      event => now - event.timestamp <= this.monitoringPeriod
    );
  }

  /**
   * Get circuit breaker statistics
   */
  getStats() {
    const recentEvents = this.getRecentEvents();
    const recentFailures = recentEvents.filter(e => e.type === 'failure').length;
    const recentSuccesses = recentEvents.filter(e => e.type === 'success').length;

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      failureThreshold: this.failureThreshold,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      recoveryTimeout: this.recoveryTimeout,
      recentEvents: {
        total: recentEvents.length,
        failures: recentFailures,
        successes: recentSuccesses,
        failureRate: recentEvents.length > 0 ? (recentFailures / recentEvents.length) * 100 : 0
      },
      canAttemptReset: this.canAttemptReset(),
      timeUntilNextAttempt: this.nextAttemptTime ? Math.max(0, this.nextAttemptTime - Date.now()) : 0
    };
  }

  /**
   * Force reset the circuit breaker
   */
  forceReset() {
    this.reset();
    this.monitoringWindow = [];
    logger.info('🔄 Circuit breaker force reset');
  }

  /**
   * Force open the circuit breaker
   */
  forceOpen() {
    this.open();
    logger.info('🔴 Circuit breaker force opened');
  }

  /**
   * Add event listener
   */
  on(event, listener) {
    if (this.listeners[event]) {
      this.listeners[event].push(listener);
    }
  }

  /**
   * Remove event listener
   */
  off(event, listener) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(listener);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          logger.error('Circuit breaker event listener error:', error);
        }
      });
    }
  }

  /**
   * Create a circuit breaker wrapper for a function
   */
  static wrap(fn, options = {}) {
    const circuitBreaker = new CircuitBreaker(options);

    return async function(...args) {
      return circuitBreaker.execute(fn, ...args);
    };
  }

  /**
   * Create a circuit breaker for HTTP requests
   */
  static forHttp(options = {}) {
    const circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 60000,
      expectedErrorThreshold: 50,
      ...options
    });

    return {
      execute: async (requestFn, ...args) => {
        return circuitBreaker.execute(async () => {
          const response = await requestFn(...args);

          // Consider HTTP 5xx as failures
          if (response.status >= 500) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            error.response = response;
            throw error;
          }

          return response;
        });
      },
      getStats: () => circuitBreaker.getStats(),
      forceReset: () => circuitBreaker.forceReset(),
      forceOpen: () => circuitBreaker.forceOpen(),
      on: (event, listener) => circuitBreaker.on(event, listener),
      off: (event, listener) => circuitBreaker.off(event, listener)
    };
  }

  /**
   * Create a circuit breaker with custom health check
   */
  static withHealthCheck(healthCheckFn, options = {}) {
    const circuitBreaker = new CircuitBreaker(options);

    // Periodic health check
    const healthCheckInterval = options.healthCheckInterval || 30000;
    const healthCheckTimer = setInterval(async () => {
      if (circuitBreaker.isOpen()) {
        try {
          await healthCheckFn();
          logger.info('🟡 Health check passed, circuit breaker ready for reset');
        } catch (error) {
          logger.info('🔴 Health check failed, circuit breaker remains open');
          circuitBreaker.nextAttemptTime = Date.now() + circuitBreaker.recoveryTimeout;
        }
      }
    }, healthCheckInterval);

    // Cleanup timer when circuit breaker is destroyed
    circuitBreaker.destroy = () => {
      clearInterval(healthCheckTimer);
    };

    return circuitBreaker;
  }
}

/**
 * Circuit Breaker Registry
 * Manages multiple circuit breakers
 */
class CircuitBreakerRegistry {
  constructor() {
    this.breakers = new Map();
  }

  /**
   * Get or create a circuit breaker
   */
  get(name, options = {}) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(options));
    }
    return this.breakers.get(name);
  }

  /**
   * Create a circuit breaker
   */
  create(name, options = {}) {
    const breaker = new CircuitBreaker(options);
    this.breakers.set(name, breaker);
    return breaker;
  }

  /**
   * Remove a circuit breaker
   */
  remove(name) {
    const breaker = this.breakers.get(name);
    if (breaker && breaker.destroy) {
      breaker.destroy();
    }
    return this.breakers.delete(name);
  }

  /**
   * Get all circuit breakers
   */
  getAll() {
    return Array.from(this.breakers.entries()).map(([name, breaker]) => ({
      name,
      ...breaker.getStats()
    }));
  }

  /**
   * Get circuit breaker statistics
   */
  getStats() {
    const stats = {
      total: this.breakers.size,
      open: 0,
      halfOpen: 0,
      closed: 0
    };

    for (const [name, breaker] of this.breakers) {
      switch (breaker.state) {
        case 'OPEN':
          stats.open++;
          break;
        case 'HALF_OPEN':
          stats.halfOpen++;
          break;
        case 'CLOSED':
          stats.closed++;
          break;
      }
    }

    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    for (const [name, breaker] of this.breakers) {
      breaker.forceReset();
    }
    logger.info(`🔄 Reset ${this.breakers.size} circuit breakers`);
  }

  /**
   * Cleanup all circuit breakers
   */
  cleanup() {
    for (const [name, breaker] of this.breakers) {
      if (breaker.destroy) {
        breaker.destroy();
      }
    }
    this.breakers.clear();
    logger.info('🧹 Circuit breaker registry cleaned up');
  }
}

// Create singleton registry
const registry = new CircuitBreakerRegistry();

module.exports = {
  CircuitBreaker,
  CircuitBreakerRegistry,
  registry
};
