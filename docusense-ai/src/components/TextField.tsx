import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string | null;
  hint?: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, icon, trailing, className = '', ...input },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field ${error ? 'field--invalid' : ''} ${className}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        {icon ? <span className="field__icon" aria-hidden="true">{icon}</span> : null}
        <input
          ref={ref}
          id={id}
          className="field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...input}
        />
        {trailing}
      </div>
      {error ? (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      ) : null}
      {hint ? (
        <div id={hintId} className="field__hint">
          {hint}
        </div>
      ) : null}
    </div>
  );
});
