import type { ReactNode } from "react";
// Style
import "./Disclosure.css";
// Components
import { Icon } from "@/components";

type DisclosureProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function Disclosure({
  title,
  defaultOpen = false,
  children,
}: DisclosureProps) {
  return (
    <details className="disclosure" open={defaultOpen}>
      <summary className="disclosure__summary">
        <span className="label">{title}</span>
        <Icon name="chevronDown" className="disclosure__chevron" />
      </summary>
      <div className="disclosure__body">{children}</div>
    </details>
  );
}
