// Hooks
import type { InvoiceController } from "@/hooks";
// Components
import { Button, Disclosure, Select, TextInput, Textarea } from "@/components";
import { ListRow } from "./ListRow";
// Utils
import { pickOption } from "@/lib/qr";
import { STATUS_OPTIONS, finiteOrZero } from "@/lib/invoice";

export function ItemsSection({ invoice }: { invoice: InvoiceController }) {
  const { draft } = invoice;

  return (
    <Disclosure title="Items" defaultOpen>
      {draft.items.map((item, index) => (
        <ListRow
          key={item.id}
          title={`Item ${index + 1}`}
          onRemove={
            draft.items.length > 1
              ? () => invoice.items.remove(item.id)
              : undefined
          }
        >
          <TextInput
            label="Title"
            value={item.title}
            onChange={(event) =>
              invoice.items.update(item.id, { title: event.target.value })
            }
          />
          <Textarea
            label="Description"
            rows={3}
            value={item.description}
            onChange={(event) =>
              invoice.items.update(item.id, { description: event.target.value })
            }
          />
          <div className="invoice-row">
            <TextInput
              label="Type label"
              placeholder="DP · 50%"
              value={item.kindLabel}
              onChange={(event) =>
                invoice.items.update(item.id, { kindLabel: event.target.value })
              }
            />
            <TextInput
              label="Amount"
              type="number"
              inputMode="decimal"
              step="any"
              placeholder="0"
              value={item.amount === 0 ? "" : item.amount}
              onChange={(event) =>
                invoice.items.update(item.id, {
                  amount: finiteOrZero(event.target.valueAsNumber),
                })
              }
            />
          </div>
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={item.status}
            onChange={(event) => {
              const next = pickOption(STATUS_OPTIONS, event.target.value);
              if (next) invoice.items.update(item.id, { status: next });
            }}
          />
          <Textarea
            label="Included (optional)"
            hint="One per line. Shown as a checklist."
            value={item.includes}
            onChange={(event) =>
              invoice.items.update(item.id, { includes: event.target.value })
            }
          />
        </ListRow>
      ))}
      <Button variant="outline" size="sm" onClick={invoice.items.add}>
        Add item
      </Button>
    </Disclosure>
  );
}
