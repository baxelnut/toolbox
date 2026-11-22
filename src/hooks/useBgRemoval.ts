import { useCallback, useEffect, useRef, useState } from "react";
// Utils
import { prepareImage, removeBackground, type ModelChoice } from "@/lib/bg";

export type BgState =
  | { status: "idle" }
  | { status: "working"; fraction: number | null; label: string }
  | {
      status: "done";
      name: string;
      width: number;
      height: number;
      resized: boolean;
      originalUrl: string;
      cutoutUrl: string;
      cutout: Blob;
    }
  | { status: "error"; message: string };

export function useBgRemoval() {
  const [state, setState] = useState<BgState>({ status: "idle" });
  const runRef = useRef(0);
  const urlsRef = useRef<string[]>([]);

  const revoke = useCallback(() => {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = [];
  }, []);

  useEffect(() => revoke, [revoke]);

  const process = useCallback(
    async (file: File, model: ModelChoice, useGpu: boolean) => {
      runRef.current += 1;
      const run = runRef.current;
      revoke();
      setState({ status: "working", fraction: null, label: "Reading image" });

      try {
        const prepared = await prepareImage(file);
        if (run !== runRef.current) return;

        const cutout = await removeBackground(
          prepared.blob,
          model,
          useGpu,
          (fraction, label) => {
            if (run === runRef.current) {
              setState({ status: "working", fraction, label });
            }
          },
        );
        if (run !== runRef.current) return;

        const originalUrl = URL.createObjectURL(prepared.blob);
        const cutoutUrl = URL.createObjectURL(cutout);
        urlsRef.current = [originalUrl, cutoutUrl];
        setState({
          status: "done",
          name: prepared.name,
          width: prepared.width,
          height: prepared.height,
          resized: prepared.resized,
          originalUrl,
          cutoutUrl,
          cutout,
        });
      } catch (failure) {
        if (run !== runRef.current) return;
        setState({
          status: "error",
          message:
            failure instanceof Error
              ? failure.message
              : "Background removal failed",
        });
      }
    },
    [revoke],
  );

  const reset = useCallback(() => {
    runRef.current += 1;
    revoke();
    setState({ status: "idle" });
  }, [revoke]);

  return { state, process, reset };
}
