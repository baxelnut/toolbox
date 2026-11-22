import type { MouseEventHandler, ReactNode } from "react";
import { Link } from "react-router";
// Style
import "./Button.css";
// Components
import { Icon } from "@/components";
// Utils
import { cx } from "@/lib";
import type { IconName } from "@/data/icons";

type ButtonProps = {
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md";
  block?: boolean;
  icon?: IconName | undefined;
  iconEnd?: IconName | undefined;
  className?: string | undefined;
  to?: string | undefined;
  href?: string | undefined;
  download?: string | undefined;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  title?: string | undefined;
  onClick?: MouseEventHandler<HTMLElement>;
};

export function Button({
  children,
  variant = "solid",
  size = "md",
  block = false,
  icon,
  iconEnd,
  className,
  to,
  href,
  download,
  type = "button",
  disabled = false,
  title,
  onClick,
}: ButtonProps) {
  const classes = cx(
    "btn",
    `btn--${variant}`,
    size === "sm" && "btn--sm",
    block && "btn--block",
    className,
  );

  const content = (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
      {iconEnd && <Icon name={iconEnd} />}
    </>
  );

  if (to !== undefined) {
    return (
      <Link to={to} className={classes} title={title} onClick={onClick}>
        {content}
      </Link>
    );
  }

  if (href !== undefined) {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={classes}
        title={title}
        download={download}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      title={title}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
