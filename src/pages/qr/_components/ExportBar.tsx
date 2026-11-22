// Style
import "./ExportBar.css";
// Components
import { Button, Select } from "@/components";
// Utils
import { FORMAT_OPTIONS, SIZE_OPTIONS, type ExportFormat } from "@/lib/qr";
import { pickOption } from "@/lib/qr";

type ExportBarProps = {
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  size: number;
  onSizeChange: (size: number) => void;
  disabled: boolean;
  canCopy: boolean;
  canShare: boolean;
  onDownload: () => void;
  onCopy: () => void;
  onShare: () => void;
};

export function ExportBar({
  format,
  onFormatChange,
  size,
  onSizeChange,
  disabled,
  canCopy,
  canShare,
  onDownload,
  onCopy,
  onShare,
}: ExportBarProps) {
  const showCopy = format === "png" && canCopy;

  return (
    <div className="export-bar">
      <div className="export-bar__row">
        <Select
          label="Format"
          options={FORMAT_OPTIONS}
          value={format}
          onChange={(event) => {
            const next = pickOption(FORMAT_OPTIONS, event.target.value);
            if (next) onFormatChange(next);
          }}
        />
        {format !== "svg" && (
          <Select
            label="Size"
            options={SIZE_OPTIONS}
            value={String(size)}
            onChange={(event) => onSizeChange(Number(event.target.value))}
          />
        )}
      </div>
      <Button icon="download" block disabled={disabled} onClick={onDownload}>
        Download
      </Button>
      {(showCopy || canShare) && (
        <div className="export-bar__secondary">
          {showCopy && (
            <Button
              variant="outline"
              icon="copy"
              disabled={disabled}
              onClick={onCopy}
            >
              Copy
            </Button>
          )}
          {canShare && (
            <Button variant="outline" disabled={disabled} onClick={onShare}>
              Share
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
