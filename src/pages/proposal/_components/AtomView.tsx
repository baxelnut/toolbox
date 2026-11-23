// Style
import "./ProposalPaper.css";
// Utils
import { cx } from "@/lib/cx";
import type { TableData, Atom } from "@/lib/proposal";

function Cols({ table }: { table: TableData }) {
  return (
    <colgroup>
      {table.columns.map((column, index) => (
        <col key={index} style={{ width: `${column.width}%` }} />
      ))}
    </colgroup>
  );
}

function Head({ table }: { table: TableData }) {
  return (
    <thead>
      <tr>
        {table.columns.map((column, index) => (
          <th key={index} className={`fp-align-${column.align}`}>
            {column.title}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TableHeaderView({ table }: { table: TableData }) {
  return (
    <table className="fp-table">
      <Cols table={table} />
      <Head table={table} />
    </table>
  );
}

function Body({ atom, withHeader }: { atom: Atom; withHeader: boolean }) {
  switch (atom.kind) {
    case "heading":
      return (
        <div className={`fp-h fp-h--${atom.level}`}>
          <span className="fp-h__label">{atom.label}</span>
          <span>{atom.title}</span>
        </div>
      );
    case "caption":
      return <div className="fp-caption">{atom.text}</div>;
    case "paragraph":
      return <div className="fp-p">{atom.text}</div>;
    case "note":
      return <div className="fp-note">{atom.text}</div>;
    case "item":
      return (
        <div className="fp-item">
          <span className="fp-item__marker">{atom.marker}</span>
          <div className="fp-item__body">
            {atom.lead && <div className="fp-item__lead">{atom.lead}</div>}
            {atom.text && <div className="fp-item__text">{atom.text}</div>}
          </div>
        </div>
      );
    case "row":
    case "foot": {
      const { table } = atom;
      const columns = table.columns.length;
      return (
        <table className={cx("fp-table", !withHeader && "fp-table--cont")}>
          <Cols table={table} />
          {withHeader && <Head table={table} />}
          <tbody>
            {atom.kind === "row" ? (
              <tr>
                {(table.rows[atom.index] ?? []).map((value, index) => (
                  <td
                    key={index}
                    className={`fp-align-${table.columns[index]?.align ?? "left"}`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ) : (
              <tr className="fp-foot">
                <td colSpan={Math.max(1, columns - 1)}>
                  {table.foot[atom.index]?.label}
                </td>
                <td className="fp-align-right">
                  {table.foot[atom.index]?.value}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      );
    }
    case "compare":
      return (
        <div className="fp-compare">
          {[atom.left, atom.right].map((side, index) => (
            <div key={index} className="fp-compare__col">
              <div className="fp-compare__title">{side.title}</div>
              {side.items.map((item, itemIndex) => (
                <div key={itemIndex} className="fp-compare__item">
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    case "closing": {
      const { closing } = atom;
      return (
        <div className="fp-closing">
          <div className="fp-closing__col">
            <div>{closing.leftLabel}</div>
            <div className="fp-closing__space">
              {closing.provider.image && (
                <img
                  className="fp-closing__sign"
                  src={closing.provider.image}
                  alt=""
                />
              )}
            </div>
            <div className="fp-closing__name">{closing.provider.name}</div>
            <div>{closing.provider.role}</div>
          </div>
          <div className="fp-closing__col">
            <div>{closing.rightLabel}</div>
            <div className="fp-closing__space" />
            <div className="fp-closing__name">{closing.approver.name}</div>
            <div>{closing.approver.role}</div>
          </div>
        </div>
      );
    }
  }
}

type AtomViewProps = {
  atom: Atom;
  first?: boolean;
  withHeader?: boolean;
};

export function AtomView({
  atom,
  first = false,
  withHeader = false,
}: AtomViewProps) {
  const last = (atom.kind === "row" || atom.kind === "foot") && atom.last;
  return (
    <div
      className={cx(
        "fp-atom",
        `fp-atom--${atom.kind}`,
        atom.kind === "heading" && `fp-atom--h${atom.level}`,
        last && "fp-atom--last",
        first && "fp-atom--first",
      )}
    >
      <Body atom={atom} withHeader={withHeader} />
    </div>
  );
}
