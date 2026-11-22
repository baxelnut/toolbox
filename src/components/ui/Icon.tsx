// Style
import "./Icon.css";
// Utils
import { cx } from "@/lib";
import { ICON_PATHS, type IconName } from "@/data/icons";

type IconProps = {
  name: IconName;
  size?: number;
  className?: string | undefined;
  title?: string | undefined;
};

export function Icon({ name, size = 16, className, title }: IconProps) {
  return (
    <svg
      className={cx("icon", className)}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
