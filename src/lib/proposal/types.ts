import type { NumberFormat } from "@/lib/invoice/types";

export type ProposalTemplateId = "full" | "short" | "blank";

export type BlockType =
  | "paragraph"
  | "subheading"
  | "caption"
  | "bullets"
  | "numbered"
  | "note"
  | "table"
  | "cost"
  | "payment"
  | "compare";

export type Block = {
  id: string;
  type: BlockType;
  body: string;
  label: string;
  body2: string;
  label2: string;
  counted: boolean;
};

export type Section = { id: string; title: string; blocks: Block[] };

export type ProposalSettings = {
  numberPattern: string;
  amountStyle: NumberFormat;
};

export type ProposalDraft = {
  templateId: ProposalTemplateId;
  seq: number;
  numberOverride: string;
  printed: boolean;
  issueDate: string;
  showNumber: boolean;
  showToc: boolean;
  coverTitle: string;
  clientName: string;
  clientUnit: string;
  coverLogo: string;
  projectName: string;
  providerRole: string;
  headerText: string;
  leftLabel: string;
  rightLabel: string;
  approverName: string;
  approverRole: string;
  sections: Section[];
};

export type ProposalContent = Pick<
  ProposalDraft,
  | "coverTitle"
  | "headerText"
  | "providerRole"
  | "showToc"
  | "leftLabel"
  | "rightLabel"
  | "sections"
>;
