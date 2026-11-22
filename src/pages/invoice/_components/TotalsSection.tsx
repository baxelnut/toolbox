// Hooks
import type { InvoiceController } from "@/hooks";
// Components
import { Button, Disclosure, Select, TextInput } from "@/components";
import { ListRow } from "./ListRow";
// Utils
import { pickOption } from "@/lib/qr";
import { ADJUSTMENT_OPTIONS, finiteOrZero } from "@/lib/invoice";

export function TotalsSection({ invoice }: { invoice: InvoiceController }) {
  const { draft } = invoice;
  const hasPaid = draft.items.some((item) => item.status === "paid");
  const hasUpcoming = draft.items.some((item) => item.status === "upcoming");

  return (
    <Disclosure title="Totals">
      <div className="invoice-row">
        <TextInput
          label="Subtotal label"
          value={draft.subtotalLabel}
          onChange={(event) => invoice.set("subtotalLabel", event.target.value)}
        />
        <TextInput
          label="Total label"
          value={draft.totalLabel}
          onChange={(event) => invoice.set("totalLabel", event.target.value)}
        />
      </div>
      {hasPaid && (
        <TextInput
          label="Already paid label"
          value={draft.paidLabel}
          onChange={(event) => invoice.set("paidLabel", event.target.value)}
        />
      )}
      {hasUpcoming && (
        <TextInput
          label="Pay now label"
          value={draft.payNowLabel}
          onChange={(event) => invoice.set("payNowLabel", event.target.value)}
        />
      )}

      {draft.adjustments.map((adjustment, index) => (
        <ListRow
          key={adjustment.id}
          title={`Adjustment ${index + 1}`}
          onRemove={() => invoice.adjustments.remove(adjustment.id)}
        >
          <TextInput
            label="Label"
            placeholder="Potongan"
            value={adjustment.label}
            onChange={(event) =>
              invoice.adjustments.update(adjustment.id, {
                label: event.target.value,
              })
            }
          />
          <div className="invoice-row">
            <TextInput
              label="Amount"
              type="number"
              inputMode="decimal"
              step="any"
              placeholder="0"
              value={adjustment.amount === 0 ? "" : adjustment.amount}
              onChange={(event) =>
                invoice.adjustments.update(adjustment.id, {
                  amount: finiteOrZero(event.target.valueAsNumber),
                })
              }
            />
            <Select
              label="Type"
              options={ADJUSTMENT_OPTIONS}
              value={adjustment.kind}
              onChange={(event) => {
                const next = pickOption(ADJUSTMENT_OPTIONS, event.target.value);
                if (next)
                  invoice.adjustments.update(adjustment.id, { kind: next });
              }}
            />
          </div>
        </ListRow>
      ))}
      <Button variant="outline" size="sm" onClick={invoice.adjustments.add}>
        Add discount or charge
      </Button>
    </Disclosure>
  );
}
