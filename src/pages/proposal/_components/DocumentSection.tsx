// Hooks
import type { ProposalController } from "@/hooks";
// Components
import { Button, Checkbox, Disclosure } from "@/components";
import { Select, TextInput, Textarea } from "@/components";
// Utils
import { pickOption } from "@/lib/qr";
import { PROPOSAL_TEMPLATE_OPTIONS, proposalNumber } from "@/lib/proposal";

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
        hint="Switching replaces sections, cover title and labels. Client details stay."
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

      <TextInput
        label="Date"
        type="date"
        value={draft.issueDate}
        onChange={(event) => proposal.setIssueDate(event.target.value)}
      />
      <Checkbox
        label="Show number on the cover"
        checked={draft.showNumber}
        onChange={(event) => proposal.set("showNumber", event.target.checked)}
      />
      <Checkbox
        label="Contents page"
        checked={draft.showToc}
        onChange={(event) => proposal.set("showToc", event.target.checked)}
      />

      <Textarea
        label="Cover title"
        rows={3}
        hint="One line per row. Shown in capitals."
        value={draft.coverTitle}
        onChange={(event) => proposal.set("coverTitle", event.target.value)}
      />
      <TextInput
        label="Running header"
        hint="Shown at the top of every page after the cover."
        value={draft.headerText}
        onChange={(event) => proposal.set("headerText", event.target.value)}
      />
      <TextInput
        label="Your role"
        value={draft.providerRole}
        onChange={(event) => proposal.set("providerRole", event.target.value)}
      />

      <div className="proposal-row">
        <TextInput
          label="Left signature label"
          value={draft.leftLabel}
          onChange={(event) => proposal.set("leftLabel", event.target.value)}
        />
        <TextInput
          label="Right signature label"
          value={draft.rightLabel}
          onChange={(event) => proposal.set("rightLabel", event.target.value)}
        />
      </div>
      <div className="proposal-row">
        <TextInput
          label="Approver name"
          value={draft.approverName}
          onChange={(event) => proposal.set("approverName", event.target.value)}
        />
        <TextInput
          label="Approver role"
          value={draft.approverRole}
          onChange={(event) => proposal.set("approverRole", event.target.value)}
        />
      </div>

      <small className="muted">
        Tokens for any text: {"{client}"} {"{unit}"} {"{project}"}{" "}
        {"{provider}"} {"{date}"} {"{number}"} {"{total}"}
      </small>
    </Disclosure>
  );
}
