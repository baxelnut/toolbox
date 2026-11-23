import type { ReactNode } from "react";
// Style
import "./ProposalPaper.css";
// Components
import { AtomView } from "./AtomView";
// Utils
import { TOC_LINES } from "@/lib/proposal";
import type { ProposalDocument, Layout, TocEntry } from "@/lib/proposal";

function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    out.push(items.slice(index, index + size));
  }
  return out;
}

function Page({
  headerText,
  number,
  children,
}: {
  headerText: string;
  number: number;
  children: ReactNode;
}) {
  return (
    <section className="fp-page">
      <div className="fp-header">{headerText}</div>
      <div className="fp-body">{children}</div>
      <div className="fp-footer">{number}</div>
    </section>
  );
}

function TocRow({ entry }: { entry: TocEntry }) {
  return (
    <div className={`fp-toc__row fp-toc__row--${entry.level}`}>
      <span className="fp-toc__label">{entry.label}</span>
      <span>{entry.title}</span>
      <span className="fp-toc__dots" />
      <span className="fp-toc__page">{entry.page}</span>
    </div>
  );
}

type ProposalPaperProps = { doc: ProposalDocument; layout: Layout };

export function ProposalPaper({ doc, layout }: ProposalPaperProps) {
  const { cover } = doc;
  const tocChunks = chunk(layout.toc, TOC_LINES);
  const tocPages = tocChunks.length > 0 ? tocChunks : [[]];

  return (
    <div className="fp">
      <section className="fp-page fp-cover">
        <div className="fp-cover__title">
          {cover.title.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
        <div className="fp-cover__mid">
          {cover.logo && (
            <img className="fp-cover__logo" src={cover.logo} alt="" />
          )}
        </div>
        <div className="fp-cover__client">
          <div className="fp-cover__strong">{cover.client}</div>
          <div>{cover.unit}</div>
        </div>
        <div className="fp-cover__by">
          <div>{cover.byLabel}</div>
          <div className="fp-cover__strong">{cover.provider}</div>
          <div>{cover.providerRole}</div>
        </div>
        <div className="fp-cover__date">
          <div>{cover.date}</div>
          {cover.numberText && <div>{cover.numberText}</div>}
        </div>
      </section>

      {doc.showToc &&
        tocPages.map((entries, index) => (
          <Page key={index} headerText={doc.headerText} number={2 + index}>
            {index === 0 && <div className="fp-toc__title">Daftar Isi</div>}
            {entries.map((entry) => (
              <TocRow key={entry.key} entry={entry} />
            ))}
          </Page>
        ))}

      {layout.pages.map((page, index) => (
        <Page
          key={index}
          headerText={doc.headerText}
          number={layout.firstBodyPage + index}
        >
          {page.map((placed) => (
            <AtomView
              key={placed.atom.key}
              atom={placed.atom}
              first={placed.first}
              withHeader={placed.withHeader}
            />
          ))}
        </Page>
      ))}
    </div>
  );
}
