// Style
import "./TypePicker.css";

type TypePickerProps<T extends string> = {
  types: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
};

export function TypePicker<T extends string>({
  types,
  value,
  onChange,
}: TypePickerProps<T>) {
  return (
    <div className="type-picker" role="group" aria-label="QR type">
      {types.map((item) => (
        <button
          key={item.id}
          type="button"
          className="tab type-picker__tab"
          aria-pressed={item.id === value}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
