import { Select, TextInput, Textarea } from "@/components";
// Style
import "./TypeFields.css";
// Utils
import type { FieldDef, QrValues } from "@/lib/qr";

type TypeFieldsProps = {
  fields: readonly FieldDef[];
  values: QrValues;
  onChange: (key: string, value: string) => void;
};

export function TypeFields({ fields, values, onChange }: TypeFieldsProps) {
  return (
    <div className="type-fields">
      {fields.map((field) => {
        const value = values[field.key] ?? "";

        if (field.kind === "select") {
          return (
            <Select
              key={field.key}
              label={field.label}
              hint={field.hint}
              options={field.options ?? []}
              value={value}
              onChange={(event) => onChange(field.key, event.target.value)}
            />
          );
        }

        if (field.kind === "textarea") {
          return (
            <Textarea
              key={field.key}
              label={field.label}
              hint={field.hint}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              value={value}
              onChange={(event) => onChange(field.key, event.target.value)}
            />
          );
        }

        return (
          <TextInput
            key={field.key}
            type={field.kind}
            label={field.label}
            hint={field.hint}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => onChange(field.key, event.target.value)}
          />
        );
      })}
    </div>
  );
}
