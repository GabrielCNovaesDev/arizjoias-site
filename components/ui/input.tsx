import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="font-body text-xs tracking-[0.1em] uppercase opacity-60"
          style={{ color: "var(--charcoal)" }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-elegant ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="font-body text-xs mt-1"
          style={{ color: "var(--rosegold)" }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
