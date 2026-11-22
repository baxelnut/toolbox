import { useId, useState } from "react";
// Style
import "./DropZone.css";
// Utils
import { cx } from "@/lib/cx";

type DropZoneProps = {
  onFile: (file: File) => void;
  disabled?: boolean;
};

export function DropZone({ onFile, disabled = false }: DropZoneProps) {
  const id = useId();
  const [over, setOver] = useState(false);

  return (
    <label
      htmlFor={id}
      className={cx(
        "dropzone",
        over && "dropzone--over",
        disabled && "dropzone--disabled",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const file = event.dataTransfer.files[0];
        if (file && !disabled) onFile(file);
      }}
    >
      <input
        id={id}
        className="visually-hidden"
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) onFile(file);
          event.currentTarget.value = "";
        }}
      />
      <span className="dropzone__title">Drop an image here</span>
      <span className="dropzone__hint muted">
        Or click to choose. You can also paste with Ctrl+V.
      </span>
      <span className="dropzone__hint muted">
        JPG, PNG or WebP, up to 20 MB.
      </span>
    </label>
  );
}
