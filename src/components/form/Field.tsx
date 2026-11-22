import { useId, type ReactNode } from "react";
// Style
import "./Field.css";
// Utils
import { cx } from "@/lib";

export type ControlProps = {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
};

type FieldProps = {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  className?: string | undefined;
  children: (control: ControlProps) => ReactNode;
};

export function Field({ label, hint, error, className, children }: FieldProps) {
  const uid = useId();
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cx("field", className)}>
      <label className="label" htmlFor={uid}>
        {label}
      </label>
      {children({
        id: uid,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
