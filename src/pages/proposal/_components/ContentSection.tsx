// Hooks
import type { ProposalController } from "@/hooks";
// Components
import { Button, Disclosure, ListRow } from "@/components";
import { Select, TextInput, Textarea } from "@/components";
// Utils
import { pickOption } from "@/lib/qr";
import { KIND_OPTIONS, WIDTH_OPTIONS, type BlockKind } from "@/lib/invoice";

const BODY_HINT: Record<BlockKind, string> = {
  checklist: "One item per line.",
  text: "A plain paragraph.",
  callout: "Lines starting with - become a list. Other lines are paragraphs.",
};

export function ContentSection({ proposal }: { proposal: ProposalController }) {
  const { draft } = proposal;

  return (
    <>
      <Disclosure title="Summary and sections" defaultOpen>
        <Textarea
          label="Summary"
          rows={4}
          value={draft.summary}
          onChange={(event) => proposal.set("summary", event.target.value)}
        />
        {draft.blocks.map((block, index) => (
          <ListRow
            key={block.id}
            title={block.title || `Section ${index + 1}`}
            onRemove={() => proposal.blocks.remove(block.id)}
          >
            <TextInput
              label="Title"
              value={block.title}
              onChange={(event) =>
                proposal.blocks.update(block.id, { title: event.target.value })
              }
            />
            <div className="proposal-row">
              <Select
                label="Style"
                options={KIND_OPTIONS}
                value={block.kind}
                onChange={(event) => {
                  const next = pickOption(KIND_OPTIONS, event.target.value);
                  if (next) proposal.blocks.update(block.id, { kind: next });
                }}
              />
              <Select
                label="Width"
                options={WIDTH_OPTIONS}
                value={block.width}
                onChange={(event) => {
                  const next = pickOption(WIDTH_OPTIONS, event.target.value);
                  if (next) proposal.blocks.update(block.id, { width: next });
                }}
              />
            </div>
            <Textarea
              label="Content"
              hint={BODY_HINT[block.kind]}
              rows={5}
              value={block.body}
              onChange={(event) =>
                proposal.blocks.update(block.id, { body: event.target.value })
              }
            />
          </ListRow>
        ))}
        <Button variant="outline" size="sm" onClick={proposal.blocks.add}>
          Add section
        </Button>
      </Disclosure>

      <Disclosure title="Terms and closing">
        <Textarea
          label="Terms"
          rows={5}
          value={draft.terms}
          onChange={(event) => proposal.set("terms", event.target.value)}
        />
        <Textarea
          label="Closing note"
          hint="Shown above the signatures."
          rows={3}
          value={draft.closing}
          onChange={(event) => proposal.set("closing", event.target.value)}
        />
      </Disclosure>
    </>
  );
}
