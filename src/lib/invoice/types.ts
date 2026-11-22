export type TemplateId = "retainer" | "project-dp" | "project-final" | "blank";
export type LineStatus = "due" | "paid" | "upcoming";
export type AdjustmentKind = "discount" | "charge";
export type BlockKind = "checklist" | "text" | "callout";
export type BlockWidth = "half" | "full";
export type NumberFormat = "comma" | "dot";
export type Counters = Record<string, number>;

export type LineItem = {
  id: string;
  title: string;
  description: string;
  kindLabel: string;
  amount: number;
  status: LineStatus;
  includes: string;
};

export type Adjustment = {
  id: string;
  label: string;
  amount: number;
  kind: AdjustmentKind;
};

export type MetaField = { id: string; label: string; value: string };

export type Block = {
  id: string;
  title: string;
  kind: BlockKind;
  width: BlockWidth;
  body: string;
};

export type InvoiceDraft = {
  templateId: TemplateId;
  seq: number;
  numberOverride: string;
  printed: boolean;
  issueDate: string;
  termDays: number;
  clientName: string;
  clientAddress: string;
  subtitle: string;
  kindHeader: string;
  meta: MetaField[];
  items: LineItem[];
  subtotalLabel: string;
  totalLabel: string;
  payNowLabel: string;
  paidLabel: string;
  adjustments: Adjustment[];
  blocks: Block[];
  legalNote: string;
  termsTitle: string;
  terms: string;
};

export type DraftContent = Pick<
  InvoiceDraft,
  | "termDays"
  | "subtitle"
  | "kindHeader"
  | "meta"
  | "items"
  | "subtotalLabel"
  | "totalLabel"
  | "payNowLabel"
  | "paidLabel"
  | "adjustments"
  | "blocks"
  | "legalNote"
  | "termsTitle"
  | "terms"
>;

export type Profile = {
  name: string;
  email: string;
  phone: string;
  website: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  signerName: string;
  signerRole: string;
  signature: string;
  numberPattern: string;
  numberFormat: NumberFormat;
  currency: string;
};
