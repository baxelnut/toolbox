// Style
import "./ProposalSheet.css";
// Utils
import { cx } from "@/lib/cx";
import type { SheetBlock } from "@/lib/invoice";
import type { ProposalDocument } from "@/lib/proposal";

function Segments({ block }: { block: SheetBlock }) {
  const listClass = block.kind === "callout" ? "prop-dashes" : "prop-checks";

  return (
    <>
      {block.segments.map((segment, index) =>
        segment.type === "list" ? (
          <ul key={index} className={listClass}>
            {segment.items.map((entry, entryIndex) => (
              <li key={entryIndex}>{entry}</li>
            ))}
          </ul>
        ) : (
          <div key={index} className="prop-text">
            {segment.text}
          </div>
        ),
      )}
    </>
  );
}

export function ProposalSheet({ doc }: { doc: ProposalDocument }) {
  const { labels } = doc;

  return (
    <article className="prop-sheet">
      <header className="prop-head">
        <div className="prop-sender">
          <div className="prop-sender__name">{doc.sender.name}</div>
          <div className="prop-sender__contact">
            {doc.sender.contact.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>
        <div className="prop-title">
          <div className="prop-title__word">{labels.proposal}</div>
          {doc.subtitle && (
            <div className="prop-title__sub">{doc.subtitle}</div>
          )}
          <div className="prop-title__no">
            <div className="prop-label">{labels.number}</div>
            <div className="prop-title__number">{doc.number}</div>
          </div>
        </div>
      </header>

      <section className="prop-meta">
        <div className="prop-meta__col">
          <div className="prop-field">
            <div className="prop-label">{labels.to}</div>
            <div className="prop-client">{doc.client.name}</div>
            <div className="prop-address">{doc.client.address}</div>
          </div>
        </div>
        <div className="prop-meta__col">
          <div className="prop-field">
            <div className="prop-label">{labels.issued}</div>
            <div className="prop-value">{doc.issueDate}</div>
          </div>
          <div className="prop-field">
            <div className="prop-label">{labels.validUntil}</div>
            <div className="prop-value prop-value--due">{doc.validUntil}</div>
          </div>
        </div>
        <div className="prop-meta__col">
          {doc.meta.map((field) => (
            <div key={field.id} className="prop-field">
              <div className="prop-label">{field.label}</div>
              <div className="prop-value">{field.value}</div>
            </div>
          ))}
        </div>
      </section>

      {(doc.projectTitle || doc.summary) && (
        <section className="prop-project">
          {doc.projectTitle && (
            <>
              <div className="prop-label">{labels.project}</div>
              <div className="prop-project__title">{doc.projectTitle}</div>
            </>
          )}
          {doc.summary && <div className="prop-summary">{doc.summary}</div>}
        </section>
      )}

      {doc.blocks.length > 0 && (
        <section className="prop-blocks">
          {doc.blocks.map((block) => (
            <div
              key={block.id}
              className={cx(
                "prop-block",
                block.width === "full" && "prop-block--full",
              )}
            >
              {block.title && (
                <div className="prop-label prop-block__title">
                  {block.title}
                </div>
              )}
              {block.kind === "callout" ? (
                <div className="prop-callout">
                  <Segments block={block} />
                </div>
              ) : (
                <Segments block={block} />
              )}
            </div>
          ))}
        </section>
      )}

      {doc.phases.length > 0 && (
        <section className="prop-section">
          <div className="prop-label prop-section__title">
            {labels.timeline}
          </div>
          <div className="prop-phases__head prop-label">
            <span />
            <span>{labels.phase}</span>
            <span className="prop-right">{labels.duration}</span>
          </div>
          {doc.phases.map((phase) => (
            <div key={phase.id} className="prop-phase">
              <div className="prop-phase__no">{phase.index}</div>
              <div>
                <div className="prop-phase__title">{phase.title}</div>
                {phase.description && (
                  <div className="prop-phase__desc">{phase.description}</div>
                )}
              </div>
              <div className="prop-phase__duration">{phase.duration}</div>
            </div>
          ))}
        </section>
      )}

      <section className="prop-section">
        <div className="prop-label prop-section__title">
          {labels.investment}
        </div>
        <div className="prop-items__head prop-label">
          <span>{labels.description}</span>
          <span className="prop-right">{labels.amount}</span>
        </div>
        {doc.items.map((item) => (
          <div key={item.id} className="prop-item">
            <div>
              <div className="prop-item__title">{item.title}</div>
              {item.description && (
                <div className="prop-item__desc">{item.description}</div>
              )}
            </div>
            <div className="prop-item__amount">{item.amountText}</div>
          </div>
        ))}
        <div className="prop-totals">
          {doc.totals.map((row) => (
            <div
              key={row.key}
              className={cx(
                "prop-totals__row",
                `prop-totals__row--${row.tone}`,
              )}
            >
              <span className="prop-totals__label">{row.label}</span>
              <span className="prop-totals__value">{row.valueText}</span>
            </div>
          ))}
        </div>
      </section>

      {doc.schedule.length > 0 && (
        <section className="prop-section">
          <div className="prop-label prop-section__title">
            {labels.schedule}
          </div>
          {doc.schedule.map((step) => (
            <div key={step.id} className="prop-step">
              <div>
                <div className="prop-step__label">{step.label}</div>
                {step.note && (
                  <div className="prop-step__note">{step.note}</div>
                )}
              </div>
              <div className="prop-step__percent">{step.percentText}</div>
              <div className="prop-step__amount">{step.amountText}</div>
            </div>
          ))}
        </section>
      )}

      {doc.terms && (
        <section className="prop-section">
          <div className="prop-label prop-section__title">{labels.terms}</div>
          <div className="prop-terms">{doc.terms}</div>
        </section>
      )}

      <section className="prop-accept">
        <div className="prop-label prop-section__title">
          {labels.acceptance}
        </div>
        {doc.closing && <div className="prop-closing">{doc.closing}</div>}
        <div className="prop-accept__cols">
          <div className="prop-sign">
            <div className="prop-label">{labels.provider}</div>
            <div className="prop-sign__space">
              {doc.signature.image && (
                <img
                  className="prop-sign__image"
                  src={doc.signature.image}
                  alt=""
                />
              )}
            </div>
            <div className="prop-sign__line" />
            <div className="prop-sign__name">{doc.signature.name}</div>
            {doc.signature.role && (
              <div className="prop-sign__role">{doc.signature.role}</div>
            )}
            <div className="prop-sign__date">
              {labels.date}: <span className="prop-sign__blank" />
            </div>
          </div>
          <div className="prop-sign">
            <div className="prop-label">{labels.client}</div>
            <div className="prop-sign__space" />
            <div className="prop-sign__line" />
            <div className="prop-sign__name">{doc.client.name}</div>
            <div className="prop-sign__date">
              {labels.date}: <span className="prop-sign__blank" />
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
