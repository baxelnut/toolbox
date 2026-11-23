import { useMemo, useState } from "react";
import { buildAtoms, layoutDocument } from "@/lib/proposal";
import type { ProposalDocument, Measured } from "@/lib/proposal";

export function useProposalLayout(doc: ProposalDocument) {
  const atoms = useMemo(() => buildAtoms(doc), [doc]);
  const [measured, setMeasured] = useState<Measured | null>(null);

  const layout = useMemo(
    () =>
      measured ? layoutDocument(doc, measured.atoms, measured.metrics) : null,
    [doc, measured],
  );

  return { atoms, setMeasured, layout };
}
