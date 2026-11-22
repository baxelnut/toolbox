import type { ComponentPropsWithoutRef } from "react";
// Styles
import "./Control.css";
import "./Select.css";
// Components
import { Field, Icon } from "@/components";

export type SelectOption = { value: string; label: string };

type SelectProps = Omit<
  ComponentPropsWithoutRef<"select">,
  "id" | "className" | "children"
> & {
  label: string;
  options: readonly SelectOption[];
  hint?: string | undefined;
  error?: string | undefined;
  className?: string | undefined;
};

export function Select({
  label,
  options,
  hint,
  error,
  className,
  ...select
}: SelectProps) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {(control) => (
        <div className="select">
          <select {...select} {...control} className="control select__input">
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" className="select__icon" />
        </div>
      )}
    </Field>
  );
}
