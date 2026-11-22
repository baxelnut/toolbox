import type { ComponentPropsWithoutRef } from "react";
// Style
import "./Control.css";
// Components
import { Field } from "@/components";

type TextInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "id" | "className"
> & {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  className?: string | undefined;
};

export function TextInput({
  label,
  hint,
  error,
  className,
  ...input
}: TextInputProps) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {(control) => <input {...input} {...control} className="control" />}
    </Field>
  );
}
