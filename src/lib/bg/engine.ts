import type { Config } from "@imgly/background-removal";

export type ModelChoice = "small" | "standard";

export const MODEL_OPTIONS: readonly { value: ModelChoice; label: string }[] = [
  { value: "small", label: "Small (faster download)" },
  { value: "standard", label: "Standard (better edges)" },
];

const MODEL_ID = {
  small: "isnet_quint8",
  standard: "isnet_fp16",
} as const satisfies Record<ModelChoice, NonNullable<Config["model"]>>;

export type ProgressHandler = (fraction: number | null, label: string) => void;

export async function removeBackground(
  source: Blob,
  model: ModelChoice,
  useGpu: boolean,
  onProgress: ProgressHandler,
): Promise<Blob> {
  const { removeBackground: run } = await import("@imgly/background-removal");
  const downloads = new Map<string, { current: number; total: number }>();

  const attempt = (device: "cpu" | "gpu") => {
    const config: Config = {
      model: MODEL_ID[model],
      device,
      output: { format: "image/png", quality: 1 },
      progress: (key, current, total) => {
        if (key.startsWith("compute")) {
          onProgress(null, "Removing background");
          return;
        }
        downloads.set(key, { current, total });
        let loaded = 0;
        let size = 0;
        for (const entry of downloads.values()) {
          loaded += entry.current;
          size += entry.total;
        }
        onProgress(
          size > 0 ? Math.min(100, (loaded / size) * 100) : null,
          "Downloading model",
        );
      },
    };
    return run(source, config);
  };

  try {
    return await attempt(useGpu ? "gpu" : "cpu");
  } catch {
    if (useGpu) {
      try {
        return await attempt("cpu");
      } catch {
        /* handled below */
      }
    }
    throw new Error(
      "Could not run the model. The first run needs a connection to download it.",
    );
  }
}
