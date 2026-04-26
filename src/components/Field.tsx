import type { ComponentProps, ReactNode } from "react";

interface FieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
}

interface TextAreaFieldProps extends ComponentProps<"textarea"> {
  label: string;
  error?: string;
}

export function Field({ label, error, required, ...props }: FieldProps) {
  return (
    <label className="grid gap-2 md:grid-cols-[160px_1fr] md:items-start">
      <span className="field-label">
        {label}
        {required ? <span className="required-mark ml-1">*</span> : null}
      </span>
      <span>
        <input
          {...props}
          required={required}
          aria-invalid={Boolean(error)}
          className={`input ${error ? "error-input" : ""}`}
        />
        {error ? <span className="danger-text mt-1 block text-xs">{error}</span> : null}
      </span>
    </label>
  );
}

export function TextAreaField({ label, error, required, ...props }: TextAreaFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="field-label pt-0">
        {label}
        {required ? <span className="required-mark ml-1">*</span> : null}
      </span>
      <textarea
        {...props}
        required={required}
        aria-invalid={Boolean(error)}
        className={`input min-h-24 resize-y leading-6 ${error ? "error-input" : ""}`}
      />
      {error ? <span className="danger-text text-xs">{error}</span> : null}
    </label>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card-section">
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  );
}
