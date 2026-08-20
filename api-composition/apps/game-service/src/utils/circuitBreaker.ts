type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  successThreshold: number;
  callTimeout?: number;
}

class CircuitBreaker {
  private readonly failureThreshold: number;
  private readonly recoveryTimeout: number;
  private readonly successThreshold: number;
  private readonly callTimeout: number | null;

  private state: State = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private lastFailureTime: number | null = null;
  private halfOpenInFlight = false;

  constructor(options: CircuitBreakerOptions) {
    this.failureThreshold = options.failureThreshold;
    this.recoveryTimeout = options.recoveryTimeout;
    this.successThreshold = options.successThreshold;
    this.callTimeout = options.callTimeout ?? null;
  }

  getState(): State {
    return this.state;
  }

  async call<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.lastFailureTime !== null && Date.now() - this.lastFailureTime >= this.recoveryTimeout) {
        this.transitionTo('HALF_OPEN');
      } else {
        throw new Error('Circuit is open');
      }
    }

    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenInFlight) {
        throw new Error('Circuit is half-open; a trial request is already in progress');
      }
      this.halfOpenInFlight = true;
    }

    try {
      const result = await this.runAction(action);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async runAction<T>(action: () => Promise<T>): Promise<T> {
    if (this.callTimeout === null) {
      return action();
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('Circuit breaker call timed out')),
        this.callTimeout as number
      );
    });

    try {
      return await Promise.race([action(), timeoutPromise]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.halfOpenInFlight = false;
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.transitionTo('CLOSED');
      }
      return;
    }

    this.failures = 0;
  }

  private onFailure() {
    if (this.state === 'HALF_OPEN') {
      this.halfOpenInFlight = false;
      this.open();
      return;
    }

    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.open();
    }
  }

  private open() {
    this.transitionTo('OPEN');
    this.lastFailureTime = Date.now();
  }

  private transitionTo(newState: State) {
    if (this.state === newState) {
      return;
    }

    this.state = newState;
    this.failures = 0;
    this.successes = 0;

    if (newState !== 'HALF_OPEN') {
      this.halfOpenInFlight = false;
    }
  }
}

export default CircuitBreaker;
export type { CircuitBreakerOptions };
