import type { RefObject } from "react";
// Style
import "./QrPreview.css";
// Utils
import { cx } from "@/lib";

type QrPreviewProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  hasPayload: boolean;
  payload: string;
  warning: string | null;
  error: string | null;
};

export function QrPreview({
  containerRef,
  hasPayload,
  payload,
  warning,
  error,
}: QrPreviewProps) {
  return (
    <section className="qr-preview" aria-label="Preview">
      <div
        className={cx(
          "qr-preview__frame",
          !hasPayload && "qr-preview__frame--empty",
        )}
      >
        <div
          ref={containerRef}
          className="qr-preview__canvas"
          role="img"
          aria-label="QR code preview"
        />
        {!hasPayload && (
          <p className="qr-preview__placeholder muted">
            Fill the form. The code appears here.
          </p>
        )}
      </div>
      {error && (
        <p className="qr-preview__error" role="alert">
          {error}
        </p>
      )}
      {warning && <p className="qr-preview__warning">{warning}</p>}
      {hasPayload && (
        <p className="qr-preview__payload mono muted">{payload}</p>
      )}
    </section>
  );
}
