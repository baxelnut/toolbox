// Hooks
import type { InvoiceController } from "@/hooks";
// Components
import { Button, Disclosure, Select } from "@/components";
import { TextInput, Textarea, ListRow } from "@/components";
// Utils
import { pickOption } from "@/lib/qr";
import { KIND_OPTIONS, WIDTH_OPTIONS, type BlockKind } from "@/lib/invoice";

const BODY_HINT: Record<BlockKind, string> = {
  checklist: "One item per line.",
  text: "A plain paragraph.",
  callout: "Lines starting with - become a list. Other lines are paragraphs.",
};

export function TextSection({ invoice }: { invoice: InvoiceController }) {
  const { draft } = invoice;

  return (
    <>
      <Disclosure title="Sections">
        {draft.blocks.map((block, index) => (
          <ListRow
            key={block.id}
            title={block.title || `Section ${index + 1}`}
            onRemove={() => invoice.blocks.remove(block.id)}
          >
            <TextInput
              label="Title"
              value={block.title}
              onChange={(event) =>
                invoice.blocks.update(block.id, { title: event.target.value })
              }
            />
            <div className="invoice-row">
              <Select
                label="Style"
                options={KIND_OPTIONS}
                value={block.kind}
                onChange={(event) => {
                  const next = pickOption(KIND_OPTIONS, event.target.value);
                  if (next) invoice.blocks.update(block.id, { kind: next });
                }}
              />
              <Select
                label="Width"
                options={WIDTH_OPTIONS}
                value={block.width}
                onChange={(event) => {
                  const next = pickOption(WIDTH_OPTIONS, event.target.value);
                  if (next) invoice.blocks.update(block.id, { width: next });
                }}
              />
            </div>
            <Textarea
              label="Content"
              hint={BODY_HINT[block.kind]}
              rows={5}
              value={block.body}
              onChange={(event) =>
                invoice.blocks.update(block.id, { body: event.target.value })
              }
            />
          </ListRow>
        ))}
        <Button variant="outline" size="sm" onClick={invoice.blocks.add}>
          Add section
        </Button>
      </Disclosure>

      <Disclosure title="Notes and terms">
        <Textarea
          label="Note"
          rows={4}
          value={draft.legalNote}
          onChange={(event) => invoice.set("legalNote", event.target.value)}
        />
        <TextInput
          label="Terms title"
          value={draft.termsTitle}
          onChange={(event) => invoice.set("termsTitle", event.target.value)}
        />
        <Textarea
          label="Terms"
          rows={5}
          value={draft.terms}
          onChange={(event) => invoice.set("terms", event.target.value)}
        />
      </Disclosure>
    </>
  );
}
