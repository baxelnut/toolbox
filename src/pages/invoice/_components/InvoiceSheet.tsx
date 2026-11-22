// Style
import "./InvoiceSheet.css";
// Utils
import { cx } from "@/lib/cx";
import type { InvoiceDocument, SheetBlock } from "@/lib/invoice";

function Segments({ block }: { block: SheetBlock }) {
  const listClass = block.kind === "callout" ? "inv-dashes" : "inv-checks";

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
          <div key={index} className="inv-text">
            {segment.text}
          </div>
        ),
      )}
    </>
  );
}

export function InvoiceSheet({ doc }: { doc: InvoiceDocument }) {
  const { labels } = doc;

  return (
    <article className="inv-sheet">
      <header className="inv-head">
        <div className="inv-sender">
          <div className="inv-sender__name">{doc.sender.name}</div>
          <div className="inv-sender__contact">
            {doc.sender.contact.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>
        <div className="inv-title">
          <div className="inv-title__word">{labels.invoice}</div>
          {doc.subtitle && <div className="inv-title__sub">{doc.subtitle}</div>}
          <div className="inv-title__no">
            <div className="inv-label">{labels.number}</div>
            <div className="inv-title__number">{doc.number}</div>
          </div>
        </div>
      </header>

      <section className="inv-meta">
        <div className="inv-meta__col">
          <div className="inv-field">
            <div className="inv-label">{labels.billTo}</div>
            <div className="inv-client">{doc.client.name}</div>
            <div className="inv-address">{doc.client.address}</div>
          </div>
        </div>
        <div className="inv-meta__col">
          <div className="inv-field">
            <div className="inv-label">{labels.issued}</div>
            <div className="inv-value">{doc.issueDate}</div>
          </div>
          <div className="inv-field">
            <div className="inv-label">{labels.due}</div>
            <div className="inv-value inv-value--due">{doc.dueDate}</div>
          </div>
        </div>
        <div className="inv-meta__col">
          {doc.meta.map((field) => (
            <div key={field.id} className="inv-field">
              <div className="inv-label">{field.label}</div>
              <div className="inv-value">{field.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="inv-items">
        <div className="inv-items__head inv-label">
          <span>{labels.description}</span>
          <span className="inv-center">{doc.kindHeader}</span>
          <span className="inv-right">{labels.amount}</span>
        </div>
        {doc.items.map((item) => (
          <div key={item.id} className="inv-item">
            <div className="inv-item__main">
              <div className="inv-item__title">{item.title}</div>
              {item.description && (
                <div className="inv-item__desc">{item.description}</div>
              )}
              {item.includes.length > 0 && (
                <>
                  <div className="inv-label inv-item__included">
                    {labels.included}
                  </div>
                  <ul className="inv-checks">
                    {item.includes.map((entry, index) => (
                      <li key={index}>{entry}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="inv-item__kind">{item.kindLabel}</div>
            <div className="inv-item__amount">
              <div>{item.amountText}</div>
              {item.paidTag && <div>{item.paidTag}</div>}
            </div>
          </div>
        ))}
      </section>

      <section className="inv-totals">
        {doc.totals.map((row) => (
          <div
            key={row.key}
            className={cx("inv-totals__row", `inv-totals__row--${row.tone}`)}
          >
            <span className="inv-totals__label">{row.label}</span>
            <span className="inv-totals__value">{row.valueText}</span>
          </div>
        ))}
      </section>

      {doc.blocks.length > 0 && (
        <section className="inv-blocks">
          {doc.blocks.map((block) => (
            <div
              key={block.id}
              className={cx(
                "inv-block",
                block.width === "full" && "inv-block--full",
              )}
            >
              {block.title && (
                <div className="inv-label inv-block__title">{block.title}</div>
              )}
              {block.kind === "callout" ? (
                <div className="inv-callout">
                  <Segments block={block} />
                </div>
              ) : (
                <Segments block={block} />
              )}
            </div>
          ))}
        </section>
      )}

      {doc.legalNote && <div className="inv-legal">{doc.legalNote}</div>}

      {(doc.payment.lines.length > 0 || doc.terms) && (
        <section className="inv-foot">
          <div className="inv-foot__col">
            {doc.payment.lines.length > 0 && (
              <>
                <div className="inv-label inv-block__title">
                  {doc.payment.title}
                </div>
                <div className="inv-pay">
                  {doc.payment.lines.map((line) => (
                    <div key={line.label} className="inv-pay__row">
                      <span>{line.label}</span>
                      <span>{line.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="inv-foot__col">
            {doc.terms && (
              <>
                <div className="inv-label inv-block__title">
                  {doc.termsTitle}
                </div>
                <div className="inv-terms">{doc.terms}</div>
              </>
            )}
          </div>
        </section>
      )}

      <footer className="inv-sign">
        {doc.signature.image && (
          <img className="inv-sign__image" src={doc.signature.image} alt="" />
        )}
        <div className="inv-sign__name">{doc.signature.name}</div>
        {doc.signature.role && (
          <div className="inv-sign__role">{doc.signature.role}</div>
        )}
      </footer>
    </article>
  );
}
