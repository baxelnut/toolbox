// Hooks
import type { ProposalController } from "@/hooks";
// Components
import { Button, Disclosure, ListRow, TextInput, Textarea } from "@/components";

export function ClientSection({ proposal }: { proposal: ProposalController }) {
  const { draft } = proposal;

  return (
    <Disclosure title="Client" defaultOpen>
      <TextInput
        label="Name"
        autoComplete="off"
        value={draft.clientName}
        onChange={(event) => proposal.set("clientName", event.target.value)}
      />
      <Textarea
        label="Address"
        value={draft.clientAddress}
        onChange={(event) => proposal.set("clientAddress", event.target.value)}
      />

      <span className="label">Extra details</span>
      <small className="muted">
        Shown in the third column, for example Estimasi durasi.
      </small>
      {draft.meta.map((field) => (
        <ListRow
          key={field.id}
          title={field.label || "Field"}
          onRemove={() => proposal.meta.remove(field.id)}
        >
          <div className="proposal-row">
            <TextInput
              label="Label"
              value={field.label}
              onChange={(event) =>
                proposal.meta.update(field.id, { label: event.target.value })
              }
            />
            <TextInput
              label="Value"
              value={field.value}
              onChange={(event) =>
                proposal.meta.update(field.id, { value: event.target.value })
              }
            />
          </div>
        </ListRow>
      ))}
      <Button variant="outline" size="sm" onClick={proposal.meta.add}>
        Add field
      </Button>
    </Disclosure>
  );
}
