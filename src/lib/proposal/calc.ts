import type { TotalRow } from "@/lib/invoice/calc";
import { round2 } from "@/lib/invoice/format";
import type { Adjustment } from "@/lib/invoice/types";
import type { PayStep, PriceItem } from "./types";

type TotalLabels = { subtotal: string; total: string };

export function proposalTotals(
  items: readonly PriceItem[],
  adjustments: readonly Adjustment[],
  labels: TotalLabels,
): { rows: TotalRow[]; total: number } {
  const subtotal = round2(items.reduce((sum, item) => sum + item.amount, 0));
  const active = adjustments.filter((adjustment) => adjustment.amount !== 0);
  const rows: TotalRow[] = [];
  let total = subtotal;

  if (active.length > 0) {
    rows.push({
      key: "subtotal",
      label: labels.subtotal,
      value: subtotal,
      tone: "plain",
    });
  }

  for (const adjustment of active) {
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

  total = round2(total);
  rows.push({ key: "total", label: labels.total, value: total, tone: "total" });
  return { rows, total };
}

export function percentSum(steps: readonly PayStep[]): number {
  return round2(steps.reduce((sum, step) => sum + step.percent, 0));
}

export type ScheduleRow = PayStep & { amount: number };

export function paymentSchedule(
  total: number,
  steps: readonly PayStep[],
): ScheduleRow[] {
  const exact = steps.length > 0 && percentSum(steps) === 100;
  let allocated = 0;

  return steps.map((step, index) => {
    const last = index === steps.length - 1;
    const amount =
      last && exact
        ? round2(total - allocated)
        : round2((total * step.percent) / 100);
    allocated = round2(allocated + amount);
    return { ...step, amount };
  });
}
