import { useId, type ComponentPropsWithoutRef } from "react";
// Style
import "./Checkbox.css";

type CheckboxProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "className" | "id"
> & {
  label: string;
  hint?: string | undefined;
};

export function Checkbox({ label, hint, ...input }: CheckboxProps) {
  const uid = useId();
  const hintId = `${uid}-hint`;

  return (
    <div className="checkbox">
      <input
        {...input}
        id={uid}
        type="checkbox"
        className="checkbox__input"
        aria-describedby={hint ? hintId : undefined}
      />
      <label htmlFor={uid} className="checkbox__label">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="checkbox__hint">
          {hint}
        </p>
      )}
    </div>
  );
}
