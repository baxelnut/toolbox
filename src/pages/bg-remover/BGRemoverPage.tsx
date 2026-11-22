import { useEffect, useState } from "react";
// Style
import "./BGRemoverPage.css";
// Contexts & Hooks
import { useBgRemoval } from "@/hooks";
import { useToast } from "@/contexts";
// Components
import { ProgressBar, ToolPage } from "@/components";
import { DropZone, ExportPanel } from "./_components";
import { ResultView, SettingsPanel } from "./_components";
// Utils
import { copyBlob, downloadBlob, CAN_COPY_IMAGE } from "@/lib/qr";
import { backgroundColor, composeBlob, extensionFor } from "@/lib/bg";
import type { BgChoice, BgFormat, ModelChoice } from "@/lib/bg";

const CAN_GPU = "gpu" in navigator;

export default function BGRemoverPage() {
  const { toast } = useToast();
  const { state, process, reset } = useBgRemoval();
  const [model, setModel] = useState<ModelChoice>("standard");
  const [useGpu, setUseGpu] = useState(false);
  const [bgChoice, setBgChoice] = useState<BgChoice>("transparent");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [format, setFormat] = useState<BgFormat>("png");
  const [view, setView] = useState<"after" | "before">("after");
  const [busy, setBusy] = useState(false);

  const working = state.status === "working";
  const background = backgroundColor(bgChoice, customColor);

  const start = (file: File) => {
    setView("after");
    void process(file, model, useGpu && CAN_GPU);
  };

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (working) return;
      const file = Array.from(event.clipboardData?.files ?? []).find((item) =>
        item.type.startsWith("image/"),
      );
      if (file) start(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  const exportAs = async (
    target: BgFormat,
    action: (blob: Blob) => Promise<void>,
  ) => {
    if (state.status !== "done" || busy) return;
    setBusy(true);
    try {
      await action(await composeBlob(state.cutout, background, target));
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  const download = () =>
    exportAs(format, async (blob) => {
      if (state.status !== "done") return;
      downloadBlob(blob, `${state.name}-no-bg.${extensionFor(format)}`);
      toast("Downloaded");
    });

  const copy = () =>
    exportAs("png", async (blob) => {
      await copyBlob(blob);
      toast("Copied");
    });

  return (
    <ToolPage toolId="background">
      <div className="bg">
        <div className="bg__stage">
          {state.status === "done" ? (
            <ResultView
              originalUrl={state.originalUrl}
              cutoutUrl={state.cutoutUrl}
              background={background}
              view={view}
              onViewChange={setView}
              width={state.width}
              height={state.height}
              resized={state.resized}
            />
          ) : working ? (
            <div className="bg__working" role="status">
              <ProgressBar
                label={state.label}
                value={state.fraction ?? undefined}
              />
            </div>
          ) : (
            <>
              {state.status === "error" && (
                <p className="bg__error" role="alert">
                  {state.message}
                </p>
              )}
              <DropZone onFile={start} />
            </>
          )}
        </div>

        <div className="bg__panel">
          <SettingsPanel
            model={model}
            onModelChange={setModel}
            useGpu={useGpu}
            onUseGpuChange={setUseGpu}
            canGpu={CAN_GPU}
            disabled={working}
          />
          {state.status === "done" && (
            <ExportPanel
              background={bgChoice}
              onBackgroundChange={setBgChoice}
              customColor={customColor}
              onCustomColorChange={setCustomColor}
              format={format}
              onFormatChange={setFormat}
              busy={busy}
              canCopy={CAN_COPY_IMAGE}
              onDownload={() => void download()}
              onCopy={() => void copy()}
              onReset={reset}
            />
          )}
        </div>
      </div>
    </ToolPage>
  );
}
