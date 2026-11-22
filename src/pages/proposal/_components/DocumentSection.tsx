// Hooks
import type { ProposalController } from "@/hooks";
// Components
import { Button, Disclosure, Select, TextInput } from "@/components";
// Utils
import { pickOption } from "@/lib/qr";
import { proposalNumber, PROPOSAL_TEMPLATE_OPTIONS } from "@/lib/proposal";

export function DocumentSection({
  proposal,
}: {
  proposal: ProposalController;
}) {
  const { draft, settings } = proposal;

  return (
    <Disclosure title="Document" defaultOpen>
      <Select
        label="Template"
        options={PROPOSAL_TEMPLATE_OPTIONS}
        value={draft.templateId}
        hint="Switching replaces sections, prices and text. Client and dates stay."
        onChange={(event) => {
          const next = pickOption(
            PROPOSAL_TEMPLATE_OPTIONS,
            event.target.value,
          );
          if (
            next &&
            window.confirm("Replace the content with this template?")
          ) {
            proposal.applyTemplate(next);
          }
        }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (
            window.confirm(
              "Start a new proposal? The current draft is cleared.",
            )
          ) {
            proposal.newProposal();
          }
        }}
      >
        New proposal
      </Button>

      <div className="proposal-row">
        <TextInput
          label="Sequence"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={draft.seq}
          hint={`Last issued this year: ${proposal.lastIssued}`}
          onChange={(event) => {
            const value = event.target.valueAsNumber;
            if (Number.isInteger(value) && value > 0)
              proposal.set("seq", value);
          }}
        />
        <TextInput
          label="Override number"
          placeholder="Optional"
          value={draft.numberOverride}
          hint="Leave empty to use the format."
          onChange={(event) =>
            proposal.set("numberOverride", event.target.value)
          }
        />
      </div>
      <small className="mono">Number: {proposalNumber(draft, settings)}</small>
      {draft.seq !== proposal.nextFree &&
        draft.numberOverride.trim() === "" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => proposal.set("seq", proposal.nextFree)}
          >
            Use next free number
          </Button>
        )}

      <div className="proposal-row">
        <TextInput
          label="Issue date"
          type="date"
          value={draft.issueDate}
          onChange={(event) => proposal.setIssueDate(event.target.value)}
        />
        <TextInput
          label="Valid (days)"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={draft.validDays}
          onChange={(event) => {
            const value = event.target.valueAsNumber;
            if (Number.isInteger(value) && value >= 0) {
              proposal.set("validDays", value);
            }
          }}
        />
        <TextInput
          label="Valid until"
          type="date"
          min={draft.issueDate}
          value={proposal.validUntil}
          onChange={(event) => proposal.setValidUntil(event.target.value)}
        />
      </div>

      <TextInput
        label="Subtitle"
        value={draft.subtitle}
        onChange={(event) => proposal.set("subtitle", event.target.value)}
      />
      <TextInput
        label="Project title"
        placeholder="E-Palugada Kasongan"
        value={draft.projectTitle}
        onChange={(event) => proposal.set("projectTitle", event.target.value)}
      />
    </Disclosure>
  );
}
