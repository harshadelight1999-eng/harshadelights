import { cn } from "../../lib/utils";
import React, { InputHTMLAttributes, forwardRef } from "react";

// Base Input component
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helper?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, label, helper, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        {helper && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Input Group component for complex inputs
export interface InputGroupProps {
  className?: string;
  children: React.ReactNode;
  error?: string;
  label?: string;
}

export interface InputGroupTextProps {
  className?: string;
  children: React.ReactNode;
}

const InputGroup = ({ className, children, error, label }: InputGroupProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className={cn(
          "input-group focus-within:shadow-lg focus-within:ring-2 focus-within:ring-ring transition-all relative flex items-center w-full rounded-md border border-input bg-background overflow-hidden",
          error && "border-red-500 focus-within:ring-red-500",
          className
        )}
      >
        {children}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

const InputGroupText = ({ className, children }: InputGroupTextProps) => {
  return (
    <div className={cn("px-3 py-2 text-sm text-gray-500 bg-gray-50 border-r border-input", className)}>
      {children}
    </div>
  );
};

const InputGroupInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex-1 px-3 py-2 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        ref={ref}
        {...props}
      />
    );
  }
);

InputGroupInput.displayName = "InputGroupInput";

// Compound component pattern
InputGroup.Text = InputGroupText;
InputGroup.Input = InputGroupInput;

export { Input, InputGroup };