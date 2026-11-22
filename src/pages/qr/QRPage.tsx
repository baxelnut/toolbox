import { useMemo, useState } from "react";
// Style
import "./QRPage.css";
// Contexts & Hooks
import { useToast } from "@/contexts";
import { useQrPreview } from "@/hooks";
import { scanWarning } from "@/lib/qr/contrast";
// Components
import { ToolPage } from "@/components";
import { ExportBar, QrPreview } from "./_components";
import { StylePanel, TypeFields, TypePicker } from "./_components";
// Utils
import { copyBlob, downloadBlob, renderBlob, shareBlob } from "@/lib/qr";
import { brandLogoDataUrl, readImageFile } from "@/lib/qr";
import { MAX_BYTES, MAX_BYTES_WITH_LOGO, PREVIEW_SIZE } from "@/lib/qr";
import { DEFAULT_STYLE, CAN_COPY_IMAGE, CAN_SHARE_FILES } from "@/lib/qr";
import { QR_TYPES, QR_TYPE_LIST, FORMAT_EXT } from "@/lib/qr";
import { initialValues, buildQrOptions } from "@/lib/qr";
import type { QrTypeId, ExportFormat, QrStyle } from "@/lib/qr";

const ENCODER = new TextEncoder();

export default function QRPage() {
  const { toast } = useToast();
  const [typeId, setTypeId] = useState<QrTypeId>("url");
  const [values, setValues] = useState(initialValues);
  const [style, setStyle] = useState<QrStyle>(DEFAULT_STYLE);
  const [useBrandLogo, setUseBrandLogo] = useState(true);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [size, setSize] = useState(1024);
  const [busy, setBusy] = useState(false);

  const def = QR_TYPES[typeId];
  const current = values[typeId];
  const payload = def.build(current);
  const hasPayload = payload !== "";
  const brandKey = def.brandLogo?.(current) ?? null;

  const logo = useMemo(
    () =>
      customLogo ??
      (useBrandLogo && brandKey ? brandLogoDataUrl(brandKey, style.fg) : null),
    [customLogo, useBrandLogo, brandKey, style.fg],
  );

  const bytes = ENCODER.encode(payload).length;
  const limit = logo ? MAX_BYTES_WITH_LOGO : MAX_BYTES;
  const tooLong = bytes > limit;
  const limitError = tooLong
    ? `Too long: ${bytes} of ${limit} bytes. ${
        logo
          ? "Remove the logo or shorten the content."
          : "Shorten the content."
      }`
    : null;

  const previewOptions = useMemo(
    () =>
      hasPayload && !tooLong
        ? buildQrOptions(payload, style, logo, PREVIEW_SIZE)
        : null,
    [hasPayload, tooLong, payload, style, logo],
  );

  const { containerRef, error } = useQrPreview(previewOptions);
  const canExport = hasPayload && !tooLong && !busy;
  const fileBase = `qr-${typeId}`;

  const changeField = (key: string, value: string) =>
    setValues((prev) => ({
      ...prev,
      [typeId]: { ...prev[typeId], [key]: value },
    }));

  const changeStyle = (patch: Partial<QrStyle>) =>
    setStyle((prev) => ({ ...prev, ...patch }));

  const uploadLogo = async (file: File) => {
    try {
      setCustomLogo(await readImageFile(file));
    } catch (failure) {
      toast(
        failure instanceof Error ? failure.message : "Could not read the file",
      );
    }
  };

  const run = async (task: () => Promise<void>, failure: string) => {
    if (!canExport) return;
    setBusy(true);
    try {
      await task();
    } catch (caught) {
      const cancelled =
        caught instanceof DOMException && caught.name === "AbortError";
      if (!cancelled) toast(failure);
    } finally {
      setBusy(false);
    }
  };

  const exportOptions = (px: number) =>
    buildQrOptions(payload, style, logo, px);

  const download = () =>
    run(async () => {
      const px = format === "svg" ? 1024 : size;
      const blob = await renderBlob(exportOptions(px), format);
      downloadBlob(blob, `${fileBase}.${FORMAT_EXT[format]}`);
      toast("Downloaded");
    }, "Download failed");

  const copy = () =>
    run(async () => {
      const blob = await renderBlob(exportOptions(size), "png");
      await copyBlob(blob);
      toast("Copied");
    }, "Copy failed");

  const share = () =>
    run(async () => {
      const px = format === "svg" ? 1024 : size;
      const blob = await renderBlob(exportOptions(px), format);
      const shared = await shareBlob(blob, `${fileBase}.${FORMAT_EXT[format]}`);
      if (!shared) toast("Sharing is not supported here");
    }, "Share failed");

  return (
    <ToolPage toolId="qr">
      <div className="qr">
        <div className="qr__input">
          <TypePicker
            types={QR_TYPE_LIST}
            value={typeId}
            onChange={setTypeId}
          />
          <TypeFields
            fields={def.fields}
            values={current}
            onChange={changeField}
          />
        </div>

        <div className="qr__result">
          <QrPreview
            containerRef={containerRef}
            hasPayload={hasPayload}
            payload={payload}
            warning={scanWarning(style.fg, style.bg)}
            error={limitError ?? error}
          />
          <ExportBar
            format={format}
            onFormatChange={setFormat}
            size={size}
            onSizeChange={setSize}
            disabled={!canExport}
            canCopy={CAN_COPY_IMAGE}
            canShare={CAN_SHARE_FILES}
            onDownload={() => void download()}
            onCopy={() => void copy()}
            onShare={() => void share()}
          />
        </div>

        <div className="qr__style">
          <StylePanel
            style={style}
            onStyleChange={changeStyle}
            canUseBrandLogo={brandKey !== null}
            useBrandLogo={useBrandLogo}
            onUseBrandLogoChange={setUseBrandLogo}
            hasCustomLogo={customLogo !== null}
            onLogoUpload={(file) => void uploadLogo(file)}
            onLogoRemove={() => setCustomLogo(null)}
          />
        </div>
      </div>
    </ToolPage>
  );
}
