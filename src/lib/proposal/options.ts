import type { BlockType, ProposalTemplateId } from "./types";

export const PROPOSAL_TEMPLATE_OPTIONS: readonly {
  value: ProposalTemplateId;
  label: string;
}[] = [
  { value: "full", label: "Full proposal (20 sections)" },
  { value: "short", label: "Short proposal" },
  { value: "blank", label: "Blank" },
];

export const BLOCK_OPTIONS: readonly { value: BlockType; label: string }[] = [
  { value: "paragraph", label: "Paragraph" },
  { value: "subheading", label: "Subheading (numbered)" },
  { value: "caption", label: "Caption (bold line)" },
  { value: "bullets", label: "Bullet list" },
  { value: "numbered", label: "Numbered list" },
  { value: "note", label: "Note" },
  { value: "table", label: "Table" },
  { value: "cost", label: "Cost table (RAB)" },
  { value: "payment", label: "Payment schedule" },
  { value: "compare", label: "Two columns" },
];

export const BLOCK_HINTS: Record<BlockType, string> = {
  paragraph: "A blank line starts a new paragraph.",
  subheading: "Numbered automatically, for example 4.1.",
  caption: "A bold line, usually above a table.",
  bullets: "One item per line. Use Title | description for a bold lead.",
  numbered: "One item per line. Use Title | description for a bold lead.",
  note: "Small italic text, for example Catatan: ...",
  table: "First line is the header. Separate cells with |.",
  cost: "One line per item: Uraian | Vol | Satuan | Harga satuan",
  payment: "One line per step: Tahap | Persen. Amounts come from the total.",
  compare: "One item per line in each column.",
};
