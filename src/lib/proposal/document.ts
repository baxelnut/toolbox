import { addDays, formatDate } from "@/lib/invoice";
import { formatInvoiceNumber, formatMoney } from "@/lib/invoice";
import { toSegments, type SheetBlock, type SheetTotal } from "@/lib/invoice";
import type { Profile } from "@/lib/invoice/types";
import { paymentSchedule, proposalTotals } from "./calc";
import { PROPOSAL_LABELS, type ProposalLabels } from "./labels";
import type { ProposalDraft, ProposalSettings } from "./types";

export type ProposalDocument = {
  labels: ProposalLabels;
  number: string;
  subtitle: string;
  sender: { name: string; contact: string[] };
  client: { name: string; address: string };
  issueDate: string;
  validUntil: string;
  projectTitle: string;
  meta: { id: string; label: string; value: string }[];
  summary: string;
  blocks: SheetBlock[];
  phases: {
    id: string;
    index: string;
    title: string;
    duration: string;
    description: string;
  }[];
  items: {
    id: string;
    title: string;
    description: string;
    amountText: string;
  }[];
  totals: SheetTotal[];
  schedule: {
    id: string;
    label: string;
    note: string;
    percentText: string;
    amountText: string;
  }[];
  terms: string;
  closing: string;
  signature: { image: string; name: string; role: string };
};

export function proposalNumber(
  draft: ProposalDraft,
  settings: ProposalSettings,
): string {
  return (
    draft.numberOverride.trim() ||
    formatInvoiceNumber(settings.numberPattern, draft.issueDate, draft.seq)
  );
}

export function buildProposalDocument(
  draft: ProposalDraft,
  profile: Profile,
  settings: ProposalSettings,
): ProposalDocument {
  const money = (value: number) =>
    formatMoney(value, profile.currency, profile.numberFormat);

  const { rows, total } = proposalTotals(draft.items, draft.adjustments, {
    subtotal: PROPOSAL_LABELS.subtotal,
    total: PROPOSAL_LABELS.total,
  });

  const schedule = total > 0 ? paymentSchedule(total, draft.payments) : [];

  return {
    labels: PROPOSAL_LABELS,
    number: proposalNumber(draft, settings),
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
    validUntil: formatDate(addDays(draft.issueDate, draft.validDays)),
    projectTitle: draft.projectTitle.trim(),
    meta: draft.meta.filter(
      (field) => field.label.trim() !== "" || field.value.trim() !== "",
    ),
    summary: draft.summary.trim(),
    blocks: draft.blocks
      .map((block) => ({
        id: block.id,
        title: block.title.trim(),
        kind: block.kind,
        width: block.width,
        segments: toSegments(block.kind, block.body),
      }))
      .filter((block) => block.title !== "" || block.segments.length > 0),
    phases: draft.phases
      .filter(
        (phase) =>
          phase.title.trim() !== "" ||
          phase.duration.trim() !== "" ||
          phase.description.trim() !== "",
      )
      .map((phase, index) => ({
        id: phase.id,
        index: String(index + 1).padStart(2, "0"),
        title: phase.title.trim(),
        duration: phase.duration.trim(),
        description: phase.description.trim(),
      })),
    items: draft.items.map((item) => ({
      id: item.id,
      title: item.title.trim(),
      description: item.description.trim(),
      amountText: money(item.amount),
    })),
    totals: rows.map((row) => ({
      key: row.key,
      label: row.label,
      valueText: money(row.value),
      tone: row.tone,
    })),
    schedule: schedule.map((step) => ({
      id: step.id,
      label: step.label.trim(),
      note: step.note.trim(),
      percentText: `${step.percent}%`,
      amountText: money(step.amount),
    })),
    terms: draft.terms.trim(),
    closing: draft.closing.trim(),
    signature: {
      image: profile.signature,
      name: profile.signerName.trim(),
      role: profile.signerRole.trim(),
    },
  };
}
