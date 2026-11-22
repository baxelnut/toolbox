import type { ReactNode } from "react";
// Lib
import { cx } from "@/lib";

type CardProps = {
  as?: "div" | "section" | "article" | "li";
  corner?: "tr" | "tl" | "bl";
  className?: string | undefined;
  children: ReactNode;
};

export function Card({
  as: Tag = "div",
  corner = "tr",
  className,
  children,
}: CardProps) {
  return (
    <Tag
      className={cx(
        "pixel-card",
        corner !== "tr" && `pixel-card--${corner}`,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
