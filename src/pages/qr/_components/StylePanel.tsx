// Style
import "./StylePanel.css";
// Components
import { Button, Checkbox, Disclosure } from "@/components";
import { Field, Select, TextInput } from "@/components";
// Utils
import { EYE_DOT_OPTIONS, EYE_FRAME_OPTIONS, MODULE_OPTIONS } from "@/lib/qr";
import { pickOption, type QrStyle } from "@/lib/qr";

type StylePanelProps = {
  style: QrStyle;
  onStyleChange: (patch: Partial<QrStyle>) => void;
  canUseBrandLogo: boolean;
  useBrandLogo: boolean;
  onUseBrandLogoChange: (value: boolean) => void;
  hasCustomLogo: boolean;
  onLogoUpload: (file: File) => void;
  onLogoRemove: () => void;
};

export function StylePanel({
  style,
  onStyleChange,
  canUseBrandLogo,
  useBrandLogo,
  onUseBrandLogoChange,
  hasCustomLogo,
  onLogoUpload,
  onLogoRemove,
}: StylePanelProps) {
  return (
    <div className="style-panel">
      <Disclosure title="Colors">
        <div className="style-panel__row">
          <Field label="Foreground">
            {(control) => (
              <input
                {...control}
                type="color"
                className="style-panel__color"
                value={style.fg}
                onChange={(event) => onStyleChange({ fg: event.target.value })}
              />
            )}
          </Field>
          <Field label="Background">
            {(control) => (
              <input
                {...control}
                type="color"
                className="style-panel__color"
                value={style.bg}
                onChange={(event) => onStyleChange({ bg: event.target.value })}
              />
            )}
          </Field>
        </div>
      </Disclosure>

      <Disclosure title="Shape">
        <Select
          label="Modules"
          options={MODULE_OPTIONS}
          value={style.module}
          onChange={(event) => {
            const next = pickOption(MODULE_OPTIONS, event.target.value);
            if (next) onStyleChange({ module: next });
          }}
        />
        <div className="style-panel__row">
          <Select
            label="Eye frame"
            options={EYE_FRAME_OPTIONS}
            value={style.eyeFrame}
            onChange={(event) => {
              const next = pickOption(EYE_FRAME_OPTIONS, event.target.value);
              if (next) onStyleChange({ eyeFrame: next });
            }}
          />
          <Select
            label="Eye dot"
            options={EYE_DOT_OPTIONS}
            value={style.eyeDot}
            onChange={(event) => {
              const next = pickOption(EYE_DOT_OPTIONS, event.target.value);
              if (next) onStyleChange({ eyeDot: next });
            }}
          />
        </div>
      </Disclosure>

      <Disclosure title="Logo">
        <Checkbox
          label="Brand logo for this type"
          hint={canUseBrandLogo ? undefined : "No brand logo for this type."}
          checked={useBrandLogo && canUseBrandLogo}
          disabled={!canUseBrandLogo}
          onChange={(event) => onUseBrandLogoChange(event.target.checked)}
        />
        <TextInput
          type="file"
          label="Upload your own logo"
          hint="Any logo raises error correction to the highest level."
          accept="image/*"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) onLogoUpload(file);
            event.currentTarget.value = "";
          }}
        />
        {hasCustomLogo && (
          <Button variant="outline" size="sm" onClick={onLogoRemove}>
            Remove uploaded logo
          </Button>
        )}
      </Disclosure>
    </div>
  );
}
