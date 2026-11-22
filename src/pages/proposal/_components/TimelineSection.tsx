// Hooks
import type { ProposalController } from "@/hooks";
// Components
import { Button, Disclosure, ListRow, TextInput, Textarea } from "@/components";

export function TimelineSection({
  proposal,
}: {
  proposal: ProposalController;
}) {
  const { draft } = proposal;

  return (
    <Disclosure title="Timeline">
      {draft.phases.length === 0 && (
        <small className="muted">No phases. The timeline is hidden.</small>
      )}
      {draft.phases.map((phase, index) => (
        <ListRow
          key={phase.id}
          title={phase.title || `Phase ${index + 1}`}
          onRemove={() => proposal.phases.remove(phase.id)}
        >
          <div className="proposal-row">
            <TextInput
              label="Title"
              value={phase.title}
              onChange={(event) =>
                proposal.phases.update(phase.id, { title: event.target.value })
              }
            />
            <TextInput
              label="Duration"
              placeholder="2 minggu"
              value={phase.duration}
              onChange={(event) =>
                proposal.phases.update(phase.id, {
                  duration: event.target.value,
                })
              }
            />
          </div>
          <Textarea
            label="Description"
            rows={2}
            value={phase.description}
            onChange={(event) =>
              proposal.phases.update(phase.id, {
                description: event.target.value,
              })
            }
          />
        </ListRow>
      ))}
      <Button variant="outline" size="sm" onClick={proposal.phases.add}>
        Add phase
      </Button>
    </Disclosure>
  );
}
