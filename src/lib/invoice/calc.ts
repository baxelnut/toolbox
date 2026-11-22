import { round2 } from "./format";
import type { Adjustment, LineItem, LineStatus } from "./types";

export type TotalTone = "plain" | "credit" | "total";

export type TotalRow = {
  key: string;
  label: string;
  value: number;
  tone: TotalTone;
};

type TotalsInput = {
  items: readonly LineItem[];
  adjustments: readonly Adjustment[];
  subtotalLabel: string;
  totalLabel: string;
  payNowLabel: string;
  paidLabel: string;
};

export function computeTotals(input: TotalsInput): TotalRow[] {
  const sum = (status?: LineStatus) =>
    round2(
      input.items
        .filter((item) => status === undefined || item.status === status)
        .reduce((acc, item) => acc + item.amount, 0),
    );

  const hasPaid = input.items.some((item) => item.status === "paid");
  const hasUpcoming = input.items.some((item) => item.status === "upcoming");
  const due = sum("due");

  const rows: TotalRow[] = [
    {
      key: "subtotal",
      label: input.subtotalLabel,
      value: sum(),
      tone: "plain",
    },
  ];

  if (hasPaid) {
    rows.push({
      key: "paid",
      label: input.paidLabel,
      value: -sum("paid"),
      tone: "credit",
    });
  }

  if (hasUpcoming) {
    rows.push({
      key: "now",
      label: input.payNowLabel,
      value: due,
      tone: "plain",
    });
  }

  let total = due;
  for (const adjustment of input.adjustments) {
    if (adjustment.amount === 0) continue;
    const value = round2(
      adjustment.kind === "discount"
        ? -Math.abs(adjustment.amount)
        : Math.abs(adjustment.amount),
    );
    rows.push({
      key: adjustment.id,
      label: adjustment.label,
      value,
      tone: value < 0 ? "credit" : "plain",
    });
    total += value;
  }

  rows.push({
    key: "total",
    label: input.totalLabel,
    value: round2(total),
    tone: "total",
  });

  return rows;
}
