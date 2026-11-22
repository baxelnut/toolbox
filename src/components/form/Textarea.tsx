import type { ComponentPropsWithoutRef } from "react";
// Style
import "./Control.css";
// Components
import { Field } from "@/components";

type TextareaProps = Omit<
  ComponentPropsWithoutRef<"textarea">,
  "id" | "className"
> & {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  className?: string | undefined;
};

export function Textarea({
  label,
  hint,
  error,
  className,
  ...textarea
}: TextareaProps) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {(control) => (
        <textarea
          {...textarea}
          {...control}
          className="control control--multiline"
        />
      )}
    </Field>
  );
}
