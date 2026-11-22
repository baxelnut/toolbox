import { useEffect, useRef, useState, type ReactNode } from "react";
// Style
import "./SheetPreview.css";

const SHEET_WIDTH = 794;
const SHEET_HEIGHT = 1123;

export function SheetPreview({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(SHEET_HEIGHT);

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

  return (
    <div className="sheet-preview">
      {height > SHEET_HEIGHT + 2 && (
        <p className="sheet-preview__warning" role="status">
          The content is longer than one A4 page. Shorten it or the PDF runs
          onto a second page.
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
