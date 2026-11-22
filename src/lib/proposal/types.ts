import type { Adjustment, Block, MetaField } from "@/lib/invoice/types";

export type ProposalTemplateId = "build" | "retainer" | "blank";

export type Phase = {
  id: string;
  title: string;
  duration: string;
  description: string;
};

export type PriceItem = {
  id: string;
  title: string;
  description: string;
  amount: number;
};

export type PayStep = {
  id: string;
  label: string;
  percent: number;
  note: string;
};

export type ProposalSettings = { numberPattern: string };

export type ProposalDraft = {
  templateId: ProposalTemplateId;
  seq: number;
  numberOverride: string;
  printed: boolean;
  issueDate: string;
  validDays: number;
  clientName: string;
  clientAddress: string;
  subtitle: string;
  projectTitle: string;
  meta: MetaField[];
  summary: string;
  blocks: Block[];
  phases: Phase[];
  items: PriceItem[];
  adjustments: Adjustment[];
  payments: PayStep[];
  terms: string;
  closing: string;
};

export type ProposalContent = Pick<
  ProposalDraft,
  | "validDays"
  | "subtitle"
  | "meta"
  | "summary"
  | "blocks"
  | "phases"
  | "items"
  | "adjustments"
  | "payments"
  | "terms"
  | "closing"
>;
