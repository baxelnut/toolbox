// Components
import { Button, Field, Select } from "@/components";
// Utils
import { pickOption } from "@/lib/qr";
import { BG_OPTIONS, BG_FORMAT_OPTIONS } from "@/lib/bg";
import type { BgChoice, BgFormat } from "@/lib/bg";

type ExportPanelProps = {
  background: BgChoice;
  onBackgroundChange: (value: BgChoice) => void;
  customColor: string;
  onCustomColorChange: (value: string) => void;
  format: BgFormat;
  onFormatChange: (value: BgFormat) => void;
  busy: boolean;
  canCopy: boolean;
  onDownload: () => void;
  onCopy: () => void;
  onReset: () => void;
};

export function ExportPanel({
  background,
  onBackgroundChange,
  customColor,
  onCustomColorChange,
  format,
  onFormatChange,
  busy,
  canCopy,
  onDownload,
  onCopy,
  onReset,
}: ExportPanelProps) {
  return (
    <div className="bg__panel">
      <Select
        label="Background"
        options={BG_OPTIONS}
        value={background}
        onChange={(event) => {
          const next = pickOption(BG_OPTIONS, event.target.value);
          if (next) onBackgroundChange(next);
        }}
      />
      {background === "custom" && (
        <Field label="Color">
          {(control) => (
            <input
              {...control}
              type="color"
              className="bg__color"
              value={customColor}
              onChange={(event) => onCustomColorChange(event.target.value)}
            />
          )}
        </Field>
      )}
      <Select
        label="Format"
        options={BG_FORMAT_OPTIONS}
        value={format}
        hint={
          format === "jpeg" && background === "transparent"
            ? "JPG has no transparency. The background becomes white."
            : undefined
        }
        onChange={(event) => {
          const next = pickOption(BG_FORMAT_OPTIONS, event.target.value);
          if (next) onFormatChange(next);
        }}
      />
      <Button icon="download" block disabled={busy} onClick={onDownload}>
        Download
      </Button>
      {canCopy && (
        <Button
          variant="outline"
          icon="copy"
          block
          disabled={busy}
          onClick={onCopy}
        >
          Copy PNG
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={onReset}>
        New image
      </Button>
    </div>
  );
}
