import { useId } from "react";
// Style
import "./ProgressBar.css";

type ProgressBarProps = {
  label: string;
  value?: number | undefined;
};

export function ProgressBar({ label, value }: ProgressBarProps) {
  const id = useId();
  return (
    <div className="progress">
      <div className="progress__row">
        <label className="label" htmlFor={id}>
          {label}
        </label>
        {value !== undefined && (
          <span className="mono muted">{Math.round(value)}%</span>
        )}
      </div>
      <progress id={id} className="progress__bar" max={100} value={value} />
    </div>
  );
}
