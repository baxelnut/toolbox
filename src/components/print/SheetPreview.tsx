import { useEffect, useRef, useState, type ReactNode } from "react";
// Style
import "./SheetPreview.css";

const SHEET_WIDTH = 794;
const A4_HEIGHT = 1123;

type SheetPreviewProps = {
  children: ReactNode;
  multiPage?: boolean;
  pageContentHeight?: number;
  chromeHeight?: number;
};

export function SheetPreview({
  children,
  multiPage = false,
  pageContentHeight = A4_HEIGHT,
  chromeHeight = 0,
}: SheetPreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(A4_HEIGHT);

  useEffect(() => {
    const frame = frameRef.current;
    const scaler = scalerRef.current;
    if (!frame || !scaler) return;

    const measure = () => {
      setScale(Math.min(1, frame.clientWidth / SHEET_WIDTH));
      setHeight(scaler.offsetHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(scaler);
    return () => observer.disconnect();
  }, []);

  const pages = Math.max(
    1,
    Math.ceil((height - chromeHeight - 2) / pageContentHeight),
  );

  return (
    <div className="sheet-preview">
      {!multiPage && pages > 1 && (
        <p className="sheet-preview__warning" role="status">
          The content is longer than one A4 page. Shorten it or the PDF runs
          onto a second page.
        </p>
      )}
      {multiPage && pages > 1 && (
        <p className="sheet-preview__note muted" role="status">
          About {pages} A4 pages when printed. Page breaks may shift slightly.
        </p>
      )}
      <div
        ref={frameRef}
        className="sheet-preview__frame"
        style={{ height: height * scale }}
      >
        <div
          ref={scalerRef}
          className="sheet-preview__scaler"
          style={{ transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
