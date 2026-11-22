// Hooks
import type { ProposalController } from "@/hooks";
// Components
import { Button, Disclosure, ListRow } from "@/components";
import { Select, TextInput, Textarea } from "@/components";
// Utils
import { pickOption } from "@/lib/qr";
import { percentSum } from "@/lib/proposal";
import { finiteOrZero, ADJUSTMENT_OPTIONS } from "@/lib/invoice";

export function PricingSection({ proposal }: { proposal: ProposalController }) {
  const { draft } = proposal;
  const sum = percentSum(draft.payments);

  return (
    <>
      <Disclosure title="Pricing" defaultOpen>
        {draft.items.map((item, index) => (
          <ListRow
            key={item.id}
            title={item.title || `Item ${index + 1}`}
            onRemove={
              draft.items.length > 1
                ? () => proposal.items.remove(item.id)
                : undefined
            }
          >
            <TextInput
              label="Title"
              value={item.title}
              onChange={(event) =>
                proposal.items.update(item.id, { title: event.target.value })
              }
            />
            <Textarea
              label="Description"
              rows={2}
              value={item.description}
              onChange={(event) =>
                proposal.items.update(item.id, {
                  description: event.target.value,
                })
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
                proposal.items.update(item.id, {
                  amount: finiteOrZero(event.target.valueAsNumber),
                })
              }
            />
          </ListRow>
        ))}
        <Button variant="outline" size="sm" onClick={proposal.items.add}>
          Add item
        </Button>

        {draft.adjustments.map((adjustment, index) => (
          <ListRow
            key={adjustment.id}
            title={adjustment.label || `Adjustment ${index + 1}`}
            onRemove={() => proposal.adjustments.remove(adjustment.id)}
          >
            <TextInput
              label="Label"
              placeholder="Potongan"
              value={adjustment.label}
              onChange={(event) =>
                proposal.adjustments.update(adjustment.id, {
                  label: event.target.value,
                })
              }
            />
            <div className="proposal-row">
              <TextInput
                label="Amount"
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="0"
                value={adjustment.amount === 0 ? "" : adjustment.amount}
                onChange={(event) =>
                  proposal.adjustments.update(adjustment.id, {
                    amount: finiteOrZero(event.target.valueAsNumber),
                  })
                }
              />
              <Select
                label="Type"
                options={ADJUSTMENT_OPTIONS}
                value={adjustment.kind}
                onChange={(event) => {
                  const next = pickOption(
                    ADJUSTMENT_OPTIONS,
                    event.target.value,
                  );
                  if (next) {
                    proposal.adjustments.update(adjustment.id, { kind: next });
                  }
                }}
              />
            </div>
          </ListRow>
        ))}
        <Button variant="outline" size="sm" onClick={proposal.adjustments.add}>
          Add discount or charge
        </Button>
      </Disclosure>

      <Disclosure title="Payment schedule">
        {draft.payments.length > 0 && (
          <small className={sum === 100 ? "muted" : undefined}>
            Steps add up to {sum}%
            {sum === 100 ? "." : ". They must add up to 100%."}
          </small>
        )}
        {draft.payments.map((step, index) => (
          <ListRow
            key={step.id}
            title={step.label || `Step ${index + 1}`}
            onRemove={() => proposal.payments.remove(step.id)}
          >
            <div className="proposal-row">
              <TextInput
                label="Label"
                value={step.label}
                onChange={(event) =>
                  proposal.payments.update(step.id, {
                    label: event.target.value,
                  })
                }
              />
              <TextInput
                label="Percent"
                type="number"
                min={0}
                max={100}
                step="any"
                inputMode="decimal"
                value={step.percent === 0 ? "" : step.percent}
                onChange={(event) =>
                  proposal.payments.update(step.id, {
                    percent: finiteOrZero(event.target.valueAsNumber),
                  })
                }
              />
            </div>
            <Textarea
              label="Note"
              rows={2}
              value={step.note}
              onChange={(event) =>
                proposal.payments.update(step.id, { note: event.target.value })
              }
            />
          </ListRow>
        ))}
        <Button variant="outline" size="sm" onClick={proposal.payments.add}>
          Add step
        </Button>
      </Disclosure>
    </>
  );
}
