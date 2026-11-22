// Hooks
import type { InvoiceController } from "@/hooks";
// Components
import { Button, Disclosure, Select, TextInput } from "@/components";
// Utils
import { pickOption } from "@/lib/qr";
import { TEMPLATE_OPTIONS, invoiceNumber } from "@/lib/invoice";

export function DocumentSection({ invoice }: { invoice: InvoiceController }) {
  const { draft, profile } = invoice;

  return (
    <Disclosure title="Document" defaultOpen>
      <Select
        label="Template"
        options={TEMPLATE_OPTIONS}
        value={draft.templateId}
        hint="Switching replaces items and text. Client and dates stay."
        onChange={(event) => {
          const next = pickOption(TEMPLATE_OPTIONS, event.target.value);
          if (
            next &&
            window.confirm("Replace items and text with this template?")
          ) {
            invoice.applyTemplate(next);
          }
        }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (
            window.confirm("Start a new invoice? The current draft is cleared.")
          ) {
            invoice.newInvoice();
          }
        }}
      >
        New invoice
      </Button>

      <div className="invoice-row">
        <TextInput
          label="Sequence"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={draft.seq}
          hint={`Last issued this year: ${invoice.lastIssued}`}
          onChange={(event) => {
            const value = event.target.valueAsNumber;
            if (Number.isInteger(value) && value > 0) invoice.set("seq", value);
          }}
        />
        <TextInput
          label="Override number"
          placeholder="Optional"
          value={draft.numberOverride}
          hint="Leave empty to use the format."
          onChange={(event) =>
            invoice.set("numberOverride", event.target.value)
          }
        />
      </div>
      <small className="mono">Number: {invoiceNumber(draft, profile)}</small>
      {draft.seq !== invoice.nextFree && draft.numberOverride.trim() === "" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => invoice.set("seq", invoice.nextFree)}
        >
          Use next free number
        </Button>
      )}

      <div className="invoice-row">
        <TextInput
          label="Issue date"
          type="date"
          value={draft.issueDate}
          onChange={(event) => invoice.setIssueDate(event.target.value)}
        />
        <TextInput
          label="Terms (days)"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={draft.termDays}
          onChange={(event) => {
            const value = event.target.valueAsNumber;
            if (Number.isInteger(value) && value >= 0) {
              invoice.set("termDays", value);
            }
          }}
        />
        <TextInput
          label="Due date"
          type="date"
          value={invoice.dueDate}
          min={draft.issueDate}
          onChange={(event) => invoice.setDueDate(event.target.value)}
        />
      </div>

      <div className="invoice-row">
        <TextInput
          label="Subtitle"
          value={draft.subtitle}
          onChange={(event) => invoice.set("subtitle", event.target.value)}
        />
        <TextInput
          label="Type column title"
          value={draft.kindHeader}
          onChange={(event) => invoice.set("kindHeader", event.target.value)}
        />
      </div>
    </Disclosure>
  );
}
