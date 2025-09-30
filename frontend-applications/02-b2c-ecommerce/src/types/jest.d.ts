import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toBeInTheDocument(): T;
      toHaveAttribute(attr: string, value?: string): T;
      toBeDisabled(): T;
      toBe(expected: any): T;
    }
  }
  
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeDisabled(): R;
      toBe(expected: any): R;
    }
  }
}