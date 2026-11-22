import type QRCodeStyling from "qr-code-styling";

export type QrOptions = NonNullable<
  ConstructorParameters<typeof QRCodeStyling>[0]
>;

export type ModuleShape =
  | "square"
  | "dots"
  | "rounded"
  | "extra-rounded"
  | "classy"
  | "classy-rounded";
export type EyeFrame = "square" | "dot" | "extra-rounded";
export type EyeDot = "square" | "dot";

export type QrStyle = {
  fg: string;
  bg: string;
  module: ModuleShape;
  eyeFrame: EyeFrame;
  eyeDot: EyeDot;
};

export const DEFAULT_STYLE: QrStyle = {
  fg: "#000000",
  bg: "#ffffff",
  module: "square",
  eyeFrame: "square",
  eyeDot: "square",
};

export const MODULE_OPTIONS: readonly { value: ModuleShape; label: string }[] =
  [
    { value: "square", label: "Square" },
    { value: "dots", label: "Dots" },
    { value: "rounded", label: "Rounded" },
    { value: "extra-rounded", label: "Extra rounded" },
    { value: "classy", label: "Classy" },
    { value: "classy-rounded", label: "Classy rounded" },
  ];

export const EYE_FRAME_OPTIONS: readonly { value: EyeFrame; label: string }[] =
  [
    { value: "square", label: "Square" },
    { value: "dot", label: "Round" },
    { value: "extra-rounded", label: "Extra rounded" },
  ];

export const EYE_DOT_OPTIONS: readonly { value: EyeDot; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Round" },
];

export const PREVIEW_SIZE = 280;
export const MAX_BYTES = 2200;
export const MAX_BYTES_WITH_LOGO = 1200;

export function pickOption<T extends string>(
  options: readonly { value: T }[],
  value: string,
): T | undefined {
  return options.find((option) => option.value === value)?.value;
}

export function buildQrOptions(
  payload: string,
  style: QrStyle,
  logo: string | null,
  size: number,
): QrOptions {
  return {
    width: size,
    height: size,
    type: "svg",
    data: payload,
    margin: Math.round(size * 0.06),
    qrOptions: { errorCorrectionLevel: logo ? "H" : "M" },
    dotsOptions: { color: style.fg, type: style.module },
    backgroundOptions: { color: style.bg },
    cornersSquareOptions: { color: style.fg, type: style.eyeFrame },
    cornersDotOptions: { color: style.fg, type: style.eyeDot },
    image: logo ?? "",
    imageOptions: {
      crossOrigin: "anonymous",
      hideBackgroundDots: true,
      imageSize: 0.28,
      margin: Math.round(size * 0.012),
    },
  };
}
