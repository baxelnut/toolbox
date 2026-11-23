import { useLayoutEffect, useRef } from "react";
// Components
import { AtomView, TableHeaderView } from "./AtomView";
// Utils
import type { Atom, Measured, TableData } from "@/lib/proposal";

type ProposalMeasureProps = {
  atoms: readonly Atom[];
  onMeasured: (measured: Measured) => void;
};

export function ProposalMeasure({ atoms, onMeasured }: ProposalMeasureProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const heights: number[] = [];
    const tops: number[] = [];
    const headers: Record<string, number> = {};

    root.querySelectorAll<HTMLElement>("[data-atom]").forEach((node) => {
      const index = Number(node.dataset.atom);
      heights[index] = Math.ceil(node.getBoundingClientRect().height);
      const inner = node.firstElementChild;
      tops[index] =
        inner instanceof HTMLElement
          ? Number.parseFloat(getComputedStyle(inner).paddingTop) || 0
          : 0;
    });

    root.querySelectorAll<HTMLElement>("[data-header]").forEach((node) => {
      headers[node.dataset.header ?? ""] = Math.ceil(
        node.getBoundingClientRect().height,
      );
    });

    onMeasured({ atoms, metrics: { heights, tops, headers } });
  }, [atoms, onMeasured]);

  const tables = new Map<string, TableData>();
  for (const atom of atoms) {
    if (atom.kind === "row" || atom.kind === "foot") {
      tables.set(atom.table.id, atom.table);
    }
  }

  return (
    <div ref={ref} className="fp fp-measure" aria-hidden="true">
      {atoms.map((atom, index) => (
        <div key={atom.key} data-atom={index}>
          <AtomView atom={atom} />
        </div>
      ))}
      {[...tables.values()].map((table) => (
        <div key={table.id} data-header={table.id}>
          <TableHeaderView table={table} />
        </div>
      ))}
    </div>
  );
}
