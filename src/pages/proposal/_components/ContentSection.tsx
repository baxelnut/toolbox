import { useState } from "react";
// Hooks
import type { ProposalController } from "@/hooks";
// Components
import { Button, Checkbox, Disclosure } from "@/components";
import { ListRow, Select, TextInput, Textarea } from "@/components";
// Utils
import { pickOption } from "@/lib/qr";
import { BLOCK_HINTS, BLOCK_OPTIONS, roman } from "@/lib/proposal";
import type { Block, BlockType, Section } from "@/lib/proposal";

type EditorProps = {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
};

function Fields({ block, onChange }: EditorProps) {
  const hint = BLOCK_HINTS[block.type];

  switch (block.type) {
    case "subheading":
    case "caption":
      return (
        <TextInput
          label="Text"
          hint={hint}
          value={block.body}
          onChange={(event) => onChange({ body: event.target.value })}
        />
      );
    case "table":
      return (
        <>
          <Textarea
            label="Rows"
            hint={hint}
            rows={6}
            value={block.body}
            onChange={(event) => onChange({ body: event.target.value })}
          />
          <TextInput
            label="Column widths (optional)"
            placeholder="30, 70"
            hint="Percent per column. Leave empty to size automatically."
            value={block.label}
            onChange={(event) => onChange({ label: event.target.value })}
          />
        </>
      );
    case "cost":
      return (
        <>
          <Textarea
            label="Items"
            hint={hint}
            rows={6}
            value={block.body}
            onChange={(event) => onChange({ body: event.target.value })}
          />
          <TextInput
            label="Subtotal label"
            placeholder="Subtotal A"
            value={block.label}
            onChange={(event) => onChange({ label: event.target.value })}
          />
          <Checkbox
            label="Counts toward total investment"
            checked={block.counted}
            onChange={(event) => onChange({ counted: event.target.checked })}
          />
        </>
      );
    case "payment":
      return (
        <>
          <Textarea
            label="Steps"
            hint={hint}
            rows={4}
            value={block.body}
            onChange={(event) => onChange({ body: event.target.value })}
          />
          <TextInput
            label="Total label"
            placeholder="Total Investasi"
            value={block.label}
            onChange={(event) => onChange({ label: event.target.value })}
          />
        </>
      );
    case "compare":
      return (
        <>
          <TextInput
            label="Left title"
            value={block.label}
            onChange={(event) => onChange({ label: event.target.value })}
          />
          <Textarea
            label="Left items"
            hint={hint}
            rows={4}
            value={block.body}
            onChange={(event) => onChange({ body: event.target.value })}
          />
          <TextInput
            label="Right title"
            value={block.label2}
            onChange={(event) => onChange({ label2: event.target.value })}
          />
          <Textarea
            label="Right items"
            rows={4}
            value={block.body2}
            onChange={(event) => onChange({ body2: event.target.value })}
          />
        </>
      );
    default:
      return (
        <Textarea
          label="Content"
          hint={hint}
          rows={block.type === "paragraph" ? 6 : 4}
          value={block.body}
          onChange={(event) => onChange({ body: event.target.value })}
        />
      );
  }
}

function AddBlock({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [type, setType] = useState<BlockType>("paragraph");

  return (
    <div className="proposal-row">
      <Select
        label="New block"
        options={BLOCK_OPTIONS}
        value={type}
        onChange={(event) => {
          const next = pickOption(BLOCK_OPTIONS, event.target.value);
          if (next) setType(next);
        }}
      />
      <Button variant="outline" size="sm" onClick={() => onAdd(type)}>
        Add block
      </Button>
    </div>
  );
}

type SectionEditorProps = {
  section: Section;
  index: number;
  last: boolean;
  proposal: ProposalController;
};

function SectionEditor({ section, index, last, proposal }: SectionEditorProps) {
  return (
    <Disclosure title={`${roman(index + 1)}. ${section.title || "Untitled"}`}>
      <TextInput
        label="Section title"
        value={section.title}
        onChange={(event) =>
          proposal.sections.rename(section.id, event.target.value)
        }
      />
      <div className="proposal-actions">
        <Button
          variant="outline"
          size="sm"
          disabled={index === 0}
          onClick={() => proposal.sections.move(section.id, -1)}
        >
          Move up
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={last}
          onClick={() => proposal.sections.move(section.id, 1)}
        >
          Move down
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon="close"
          onClick={() => {
            if (window.confirm("Remove this section and its blocks?")) {
              proposal.sections.remove(section.id);
            }
          }}
        >
          Remove section
        </Button>
      </div>

      {section.blocks.map((block, blockIndex) => (
        <ListRow
          key={block.id}
          title={
            BLOCK_OPTIONS.find((option) => option.value === block.type)
              ?.label ?? block.type
          }
          onRemove={() => proposal.blocks.remove(section.id, block.id)}
        >
          <div className="proposal-actions">
            <Button
              variant="outline"
              size="sm"
              disabled={blockIndex === 0}
              onClick={() => proposal.blocks.move(section.id, block.id, -1)}
            >
              Up
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={blockIndex === section.blocks.length - 1}
              onClick={() => proposal.blocks.move(section.id, block.id, 1)}
            >
              Down
            </Button>
          </div>
          <Select
            label="Type"
            options={BLOCK_OPTIONS}
            value={block.type}
            onChange={(event) => {
              const next = pickOption(BLOCK_OPTIONS, event.target.value);
              if (next)
                proposal.blocks.update(section.id, block.id, { type: next });
            }}
          />
          <Fields
            block={block}
            onChange={(patch) =>
              proposal.blocks.update(section.id, block.id, patch)
            }
          />
        </ListRow>
      ))}

      <AddBlock onAdd={(type) => proposal.blocks.add(section.id, type)} />
    </Disclosure>
  );
}

export function ContentSection({ proposal }: { proposal: ProposalController }) {
  const { sections } = proposal.draft;

  return (
    <Disclosure title="Sections" defaultOpen>
      {sections.map((section, index) => (
        <SectionEditor
          key={section.id}
          section={section}
          index={index}
          last={index === sections.length - 1}
          proposal={proposal}
        />
      ))}
      <Button variant="outline" size="sm" onClick={proposal.sections.add}>
        Add section
      </Button>
    </Disclosure>
  );
}
