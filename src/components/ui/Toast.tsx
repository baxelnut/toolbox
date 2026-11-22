import { useCallback, useEffect, useMemo } from "react";
import { useRef, useState, type ReactNode } from "react";
// Style
import "./Toast.css";
// Contexts
import { ToastContext } from "@/contexts/toast";

const DURATION_MS = 2400;

type ActiveToast = { id: number; text: string };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveToast | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const counter = useRef(0);

  const toast = useCallback((text: string) => {
    window.clearTimeout(timer.current);
    counter.current += 1;
    setActive({ id: counter.current, text });
    timer.current = window.setTimeout(() => setActive(null), DURATION_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext value={api}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {active && (
          <p key={active.id} className="toast anim-fade-in">
            {active.text}
          </p>
        )}
      </div>
    </ToastContext>
  );
}
