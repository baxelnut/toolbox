import { useEffect, useRef, useState, type RefObject } from "react";
import type QRCodeStyling from "qr-code-styling";
// Lib
import type { QrOptions } from "@/lib/qr";

type QrPreview = {
  containerRef: RefObject<HTMLDivElement | null>;
  error: string | null;
};

export function useQrPreview(options: QrOptions | null): QrPreview {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !options) return;
    let cancelled = false;

    const render = async () => {
      try {
        if (qrRef.current) {
          qrRef.current.update(options);
        } else {
          const { default: Styling } = await import("qr-code-styling");
          if (cancelled) return;
          const qr = new Styling(options);
          qr.append(container);
          qrRef.current = qr;
        }
        setError(null);
      } catch {
        setError("This content cannot be encoded as a QR code.");
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [options]);

  useEffect(() => {
    const container = containerRef.current;
    return () => {
      qrRef.current = null;
      container?.replaceChildren();
    };
  }, []);

  return { containerRef, error };
}
