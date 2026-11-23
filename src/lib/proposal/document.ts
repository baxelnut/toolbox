import { formatInvoiceNumber, formatMoney, round2 } from "@/lib/invoice/format";
import type { Profile } from "@/lib/invoice/types";
import {
  cellsOf,
  fillTokens,
  formatLongDate,
  linesOf,
  parseNumber,
  roman,
} from "./parse";
import type { Block, ProposalDraft, ProposalSettings } from "./types";

export type Align = "left" | "right" | "center";
export type Column = { title: string; width: number; align: Align };
export type FootRow = { label: string; value: string };
export type TableData = {
  id: string;
  columns: Column[];
  rows: string[][];
  foot: FootRow[];
};
export type Side = { title: string; items: string[] };
export type ListItem = { lead: string; text: string };

export type Content =
  | { kind: "heading"; id: string; level: 1 | 2; label: string; title: string }
  | { kind: "caption"; id: string; text: string }
  | { kind: "paragraph"; id: string; text: string }
  | { kind: "list"; id: string; ordered: boolean; items: ListItem[] }
  | { kind: "note"; id: string; text: string }
  | { kind: "table"; id: string; table: TableData }
  | { kind: "compare"; id: string; left: Side; right: Side };

export type ProposalDocument = {
  number: string;
  cover: {
    title: string[];
    logo: string;
    client: string;
    unit: string;
    byLabel: string;
    provider: string;
    providerRole: string;
    date: string;
    numberText: string;
  };
  headerText: string;
  showToc: boolean;
  content: Content[];
  closing: {
    leftLabel: string;
    rightLabel: string;
    provider: { name: string; role: string; image: string };
    approver: { name: string; role: string };
  };
  total: number;
  issues: string[];
};

const COST_COLUMNS: Column[] = [
  { title: "No", width: 6, align: "center" },
  { title: "Uraian", width: 44, align: "left" },
  { title: "Vol", width: 8, align: "center" },
  { title: "Satuan", width: 11, align: "center" },
  { title: "Harga Satuan", width: 14, align: "right" },
  { title: "Jumlah", width: 17, align: "right" },
];

const PAYMENT_COLUMNS: Column[] = [
  { title: "Tahap Pembayaran", width: 58, align: "left" },
  { title: "Persentase", width: 16, align: "center" },
  { title: "Nominal", width: 26, align: "right" },
];

type Format = (value: number) => string;
type Fill = (text: string) => string;

export function proposalNumber(
  draft: ProposalDraft,
  settings: ProposalSettings,
): string {
  return (
    draft.numberOverride.trim() ||
    formatInvoiceNumber(settings.numberPattern, draft.issueDate, draft.seq)
  );
}

function plainNumber(value: number): string {
  return String(value).replace(".", ",");
}

function costOf(block: Block, money: Format, fill: Fill) {
  let subtotal = 0;
  const rows = linesOf(block.body).map((line, index) => {
    const cells = cellsOf(line);
    const qty =
      cells[1] === undefined || cells[1] === "" ? 1 : parseNumber(cells[1]);
    const price = parseNumber(cells[3] ?? "");
    const amount = round2(qty * price);
    subtotal = round2(subtotal + amount);
    return [
      String(index + 1),
      fill(cells[0] ?? ""),
      plainNumber(qty),
      fill(cells[2] ?? ""),
      money(price),
      money(amount),
    ];
  });
  return { rows, subtotal };
}

function paymentOf(block: Block, total: number, money: Format, fill: Fill) {
  const steps = linesOf(block.body).map((line) => {
    const cells = cellsOf(line);
    return {
      label: fill(cells[0] ?? ""),
      percent: parseNumber(cells[1] ?? ""),
    };
  });
  const sum = round2(steps.reduce((acc, step) => acc + step.percent, 0));
  let allocated = 0;
  const rows = steps.map((step, index) => {
    const last = index === steps.length - 1;
    const amount =
      last && sum === 100
        ? round2(total - allocated)
        : round2((total * step.percent) / 100);
    allocated = round2(allocated + amount);
    return [step.label, `${plainNumber(step.percent)}%`, money(amount)];
  });
  return { rows, sum };
}

function widthsOf(spec: string, all: string[][], count: number): number[] {
  const given = spec
    .split(/[ ,]+/)
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);

  const weights =
    given.length === count
      ? given
      : Array.from({ length: count }, (_, index) =>
          Math.min(
            60,
            Math.max(10, ...all.map((row) => (row[index] ?? "").length)),
          ),
        );

  const sum = weights.reduce((acc, weight) => acc + weight, 0) || 1;
  return weights.map((weight) => (weight / sum) * 100);
}

function tableOf(block: Block, fill: Fill): TableData | null {
  const lines = linesOf(block.body).map(cellsOf);
  const [header, ...rest] = lines;
  if (!header || rest.length === 0) return null;

  const count = Math.max(header.length, ...rest.map((row) => row.length));
  const pad = (row: string[]) =>
    Array.from({ length: count }, (_, index) => fill(row[index] ?? ""));
  const widths = widthsOf(block.label, lines, count);

  return {
    id: block.id,
    columns: pad(header).map((title, index) => ({
      title,
      width: widths[index] ?? 0,
      align: "left",
    })),
    rows: rest.map(pad),
    foot: [],
  };
}

function listOf(body: string, fill: Fill): ListItem[] {
  return linesOf(body).map((line) => {
    const [first = "", ...others] = line.split("|");
    return others.length > 0
      ? { lead: fill(first.trim()), text: fill(others.join("|").trim()) }
      : { lead: "", text: fill(first.trim()) };
  });
}

function sideOf(title: string, body: string, fill: Fill): Side {
  return {
    title: fill(title.trim()),
    items: linesOf(body).map((line) =>
      fill(line.replace(/^[-*\u2022]\s*/, "")),
    ),
  };
}

export function buildProposalDocument(
  draft: ProposalDraft,
  profile: Profile,
  settings: ProposalSettings,
): ProposalDocument {
  const money: Format = (value) =>
    formatMoney(value, profile.currency, settings.amountStyle);
  const number = proposalNumber(draft, settings);
  const unknown = new Set<string>();
  const issues: string[] = [];
  const provider = profile.signerName.trim() || profile.name.trim();

  const total = round2(
    draft.sections
      .flatMap((section) => section.blocks)
      .filter((block) => block.type === "cost" && block.counted)
      .reduce(
        (sum, block) =>
          sum +
          costOf(
            block,
            (value) => String(value),
            (text) => text,
          ).subtotal,
        0,
      ),
  );

  const tokens: Record<string, string> = {
    client: draft.clientName.trim(),
    unit: draft.clientUnit.trim(),
    project: draft.projectName.trim(),
    provider,
    date: formatLongDate(draft.issueDate),
    number,
    total: money(total),
  };
  const fill: Fill = (text) => fillTokens(text, tokens, unknown);

  const content: Content[] = [];
  let hasPayment = false;

  draft.sections.forEach((section, sectionIndex) => {
    content.push({
      kind: "heading",
      id: section.id,
      level: 1,
      label: `${roman(sectionIndex + 1)}.`,
      title: fill(section.title.trim()),
    });

    let sub = 0;
    for (const block of section.blocks) {
      switch (block.type) {
        case "subheading": {
          const title = fill(block.body.trim());
          if (!title) break;
          sub += 1;
          content.push({
            kind: "heading",
            id: block.id,
            level: 2,
            label: `${sectionIndex + 1}.${sub}`,
            title,
          });
          break;
        }
        case "caption": {
          const text = fill(block.body.trim());
          if (text) content.push({ kind: "caption", id: block.id, text });
          break;
        }
        case "paragraph": {
          block.body
            .split(/\n\s*\n/)
            .map((part) => part.trim())
            .filter(Boolean)
            .forEach((part, index) =>
              content.push({
                kind: "paragraph",
                id: `${block.id}-${index}`,
                text: fill(part),
              }),
            );
          break;
        }
        case "note": {
          const text = fill(block.body.trim());
          if (text) content.push({ kind: "note", id: block.id, text });
          break;
        }
        case "bullets":
        case "numbered": {
          const items = listOf(block.body, fill);
          if (items.length > 0) {
            content.push({
              kind: "list",
              id: block.id,
              ordered: block.type === "numbered",
              items,
            });
          }
          break;
        }
        case "table": {
          const table = tableOf(block, fill);
          if (table) content.push({ kind: "table", id: block.id, table });
          break;
        }
        case "cost": {
          const { rows, subtotal } = costOf(block, money, fill);
          if (rows.length > 0) {
            content.push({
              kind: "table",
              id: block.id,
              table: {
                id: block.id,
                columns: COST_COLUMNS,
                rows,
                foot: [
                  {
                    label: fill(block.label.trim()) || "Subtotal",
                    value: money(subtotal),
                  },
                ],
              },
            });
          }
          break;
        }
        case "payment": {
          const { rows, sum } = paymentOf(block, total, money, fill);
          if (rows.length > 0) {
            hasPayment = true;
            if (sum !== 100) {
              issues.push(
                `Payment steps add up to ${plainNumber(sum)}%, not 100%.`,
              );
            }
            content.push({
              kind: "table",
              id: block.id,
              table: {
                id: block.id,
                columns: PAYMENT_COLUMNS,
                rows,
                foot: [
                  {
                    label: fill(block.label.trim()) || "Total",
                    value: money(total),
                  },
                ],
              },
            });
          }
          break;
        }
        case "compare": {
          content.push({
            kind: "compare",
            id: block.id,
            left: sideOf(block.label, block.body, fill),
            right: sideOf(block.label2, block.body2, fill),
          });
          break;
        }
      }
    }
  });

  const cover = {
    title: linesOf(draft.coverTitle).map(fill),
    logo: draft.coverLogo,
    client: fill(draft.clientName.trim()),
    unit: fill(draft.clientUnit.trim()),
    byLabel: draft.leftLabel.trim(),
    provider,
    providerRole: fill(draft.providerRole.trim()),
    date: formatLongDate(draft.issueDate),
    numberText: draft.showNumber ? `Nomor: ${number}` : "",
  };

  const closing = {
    leftLabel: draft.leftLabel.trim(),
    rightLabel: draft.rightLabel.trim(),
    provider: {
      name: provider,
      role: cover.providerRole,
      image: profile.signature,
    },
    approver: {
      name: fill(draft.approverName.trim()),
      role: fill(draft.approverRole.trim()),
    },
  };

  if (!draft.clientName.trim()) issues.push("Add the client name.");
  if (cover.title.length === 0) issues.push("Add a cover title.");
  if (!provider) issues.push("Add your name under Your details.");
  if (hasPayment && total === 0) {
    issues.push(
      "Payment steps need a cost table that counts toward the total.",
    );
  }

  const headerText = fill(draft.headerText.trim());
  if (unknown.size > 0) {
    issues.push(`Unknown tokens: ${[...unknown].join(", ")}.`);
  }

  return {
    number,
    cover,
    headerText,
    showToc: draft.showToc,
    content,
    closing,
    total,
    issues,
  };
}
