// Components
import { Checkbox, Select } from "@/components";
// Utils
import { pickOption } from "@/lib/qr";
import { MODEL_OPTIONS, type ModelChoice } from "@/lib/bg";

type SettingsPanelProps = {
  model: ModelChoice;
  onModelChange: (model: ModelChoice) => void;
  useGpu: boolean;
  onUseGpuChange: (value: boolean) => void;
  canGpu: boolean;
  disabled: boolean;
};

export function SettingsPanel({
  model,
  onModelChange,
  useGpu,
  onUseGpuChange,
  canGpu,
  disabled,
}: SettingsPanelProps) {
  return (
    <div className="bg__panel">
      <Select
        label="Model"
        options={MODEL_OPTIONS}
        value={model}
        disabled={disabled}
        hint="Applies to the next image."
        onChange={(event) => {
          const next = pickOption(MODEL_OPTIONS, event.target.value);
          if (next) onModelChange(next);
        }}
      />
      <Checkbox
        label="Use GPU"
        hint={
          canGpu
            ? "Uses WebGPU and falls back to CPU if it fails."
            : "WebGPU is not available in this browser."
        }
        checked={useGpu && canGpu}
        disabled={disabled || !canGpu}
        onChange={(event) => onUseGpuChange(event.target.checked)}
      />
      <small className="muted">
        The first image downloads the model, then your browser keeps it. Your
        images never leave this device.
      </small>
    </div>
  );
}
