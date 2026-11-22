import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
// Utils
import { PAGE_FLUSH, printWithTitle } from "@/lib/print";

type PrintRootProps = {
  title: string;
  pageCss?: string;
  onDone: () => void;
  children: ReactNode;
};

export function PrintRoot({
  title,
  pageCss = PAGE_FLUSH,
  onDone,
  children,
}: PrintRootProps) {
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      if (cancelled) return;
      await printWithTitle(title, pageCss);
      if (!cancelled) onDone();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return createPortal(<div id="print-root">{children}</div>, document.body);
}
