// Hooks
import type { InvoiceController } from "@/hooks";
// Components
import { Button, Disclosure, TextInput, Textarea } from "@/components";
import { ListRow } from "./ListRow";

export function ClientSection({ invoice }: { invoice: InvoiceController }) {
  const { draft } = invoice;

  return (
    <Disclosure title="Client" defaultOpen>
      <TextInput
        label="Name"
        autoComplete="off"
        value={draft.clientName}
        onChange={(event) => invoice.set("clientName", event.target.value)}
      />
      <Textarea
        label="Address"
        value={draft.clientAddress}
        onChange={(event) => invoice.set("clientAddress", event.target.value)}
      />

      <span className="label">Extra details</span>
      <small className="muted">
        Shown in the third column, for example Proyek or Periode penagihan.
      </small>
      {draft.meta.map((field) => (
        <ListRow
          key={field.id}
          title={field.label || "Field"}
          onRemove={() => invoice.meta.remove(field.id)}
        >
          <div className="invoice-row">
            <TextInput
              label="Label"
              value={field.label}
              onChange={(event) =>
                invoice.meta.update(field.id, { label: event.target.value })
              }
            />
            <TextInput
              label="Value"
              value={field.value}
              onChange={(event) =>
                invoice.meta.update(field.id, { value: event.target.value })
              }
            />
          </div>
        </ListRow>
      ))}
      <Button variant="outline" size="sm" onClick={invoice.meta.add}>
        Add field
      </Button>
    </Disclosure>
  );
}
