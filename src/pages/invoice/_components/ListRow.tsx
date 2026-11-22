import type { ReactNode } from "react";
// Style
import "./ListRow.css";
// Components
import { Button } from "@/components";

type ListRowProps = {
  title: string;
  onRemove?: (() => void) | undefined;
  children: ReactNode;
};

export function ListRow({ title, onRemove, children }: ListRowProps) {
  return (
    <div className="list-row">
      <div className="list-row__head">
        <span className="label">{title}</span>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            icon="close"
            title={`Remove ${title}`}
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>
      <div className="list-row__body">{children}</div>
    </div>
  );
}
