import { computeTotals, type TotalTone } from "./calc";
import {
  addDays,
  formatDate,
  formatInvoiceNumber,
  formatMoney,
} from "./format";
import { LABELS, type Labels } from "./labels";
import type { BlockKind, BlockWidth, InvoiceDraft, Profile } from "./types";

export type Segment =
  | { type: "text"; text: string }
  | { type: "list"; items: string[] };

export type SheetBlock = {
  id: string;
  title: string;
  kind: BlockKind;
  width: BlockWidth;
  segments: Segment[];
};

export type SheetItem = {
  id: string;
  title: string;
  description: string;
  kindLabel: string;
  amountText: string;
  paidTag: string | null;
  includes: string[];
};

export type SheetTotal = {
  key: string;
  label: string;
  valueText: string;
  tone: TotalTone;
};

export type InvoiceDocument = {
  labels: Labels;
  number: string;
  subtitle: string;
  sender: { name: string; contact: string[] };
  client: { name: string; address: string };
  issueDate: string;
  dueDate: string;
  meta: { id: string; label: string; value: string }[];
  kindHeader: string;
  items: SheetItem[];
  totals: SheetTotal[];
  blocks: SheetBlock[];
  legalNote: string;
  payment: { title: string; lines: { label: string; value: string }[] };
  termsTitle: string;
  terms: string;
  signature: { image: string; name: string; role: string };
};

const LIST_MARK = /^[-*•]\s+/;

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function toSegments(kind: BlockKind, body: string): Segment[] {
  const rows = splitLines(body);
  if (rows.length === 0) return [];

  if (kind === "checklist") {
    return [
      { type: "list", items: rows.map((row) => row.replace(LIST_MARK, "")) },
    ];
  }

  if (kind === "text") return [{ type: "text", text: body.trim() }];

  const segments: Segment[] = [];
  for (const row of rows) {
    if (LIST_MARK.test(row)) {
      const item = row.replace(LIST_MARK, "");
      const last = segments[segments.length - 1];
      if (last?.type === "list") last.items.push(item);
      else segments.push({ type: "list", items: [item] });
    } else {
      segments.push({ type: "text", text: row });
    }
  }
  return segments;
}

export function invoiceNumber(draft: InvoiceDraft, profile: Profile): string {
  return (
    draft.numberOverride.trim() ||
    formatInvoiceNumber(profile.numberPattern, draft.issueDate, draft.seq)
  );
}

export function buildDocument(
  draft: InvoiceDraft,
  profile: Profile,
): InvoiceDocument {
  const money = (value: number) =>
    formatMoney(value, profile.currency, profile.numberFormat);

  return {
    labels: LABELS,
    number: invoiceNumber(draft, profile),
    subtitle: draft.subtitle.trim(),
    sender: {
      name: profile.name.trim(),
      contact: [profile.email, profile.phone, profile.website]
        .map((line) => line.trim())
        .filter(Boolean),
    },
    client: {
      name: draft.clientName.trim(),
      address: draft.clientAddress.trim(),
    },
    issueDate: formatDate(draft.issueDate),
    dueDate: formatDate(addDays(draft.issueDate, draft.termDays)),
    meta: draft.meta.filter(
      (field) => field.label.trim() !== "" || field.value.trim() !== "",
    ),
    kindHeader: draft.kindHeader.trim(),
    items: draft.items.map((item) => ({
      id: item.id,
      title: item.title.trim(),
      description: item.description.trim(),
      kindLabel: item.kindLabel.trim(),
      amountText: money(item.amount),
      paidTag: item.status === "paid" ? `(${LABELS.paid})` : null,
      includes: splitLines(item.includes).map((line) =>
        line.replace(LIST_MARK, ""),
      ),
    })),
    totals: computeTotals(draft).map((row) => ({
      key: row.key,
      label: row.label,
      valueText: money(row.value),
      tone: row.tone,
    })),
    blocks: draft.blocks
      .map((block) => ({
        id: block.id,
        title: block.title.trim(),
        kind: block.kind,
        width: block.width,
        segments: toSegments(block.kind, block.body),
      }))
      .filter((block) => block.title !== "" || block.segments.length > 0),
    legalNote: draft.legalNote.trim(),
    payment: {
      title: LABELS.payment,
      lines: [
        { label: LABELS.bank, value: profile.bankName.trim() },
        { label: LABELS.account, value: profile.accountNumber.trim() },
        { label: LABELS.name, value: profile.accountName.trim() },
      ].filter((line) => line.value !== ""),
    },
    termsTitle: draft.termsTitle.trim(),
    terms: draft.terms.trim(),
    signature: {
      image: profile.signature,
      name: profile.signerName.trim(),
      role: profile.signerRole.trim(),
    },
  };
}
