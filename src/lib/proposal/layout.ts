import type { ProposalDocument, Side, TableData } from "./document";

export const PAGE = {
  width: 794,
  height: 1122,
  top: 100,
  bottom: 96,
  side: 90,
} as const;
export const CONTENT_W = PAGE.width - PAGE.side * 2;
export const CONTENT_H = PAGE.height - PAGE.top - PAGE.bottom;
export const TOC_LINES = 32;

export type Closing = ProposalDocument["closing"];

export type Atom =
  | { key: string; kind: "heading"; level: 1 | 2; label: string; title: string }
  | { key: string; kind: "caption"; text: string }
  | { key: string; kind: "paragraph"; text: string }
  | { key: string; kind: "item"; marker: string; lead: string; text: string }
  | { key: string; kind: "note"; text: string }
  | { key: string; kind: "row"; table: TableData; index: number; last: boolean }
  | {
      key: string;
      kind: "foot";
      table: TableData;
      index: number;
      last: boolean;
    }
  | { key: string; kind: "compare"; left: Side; right: Side }
  | { key: string; kind: "closing"; closing: Closing };

export type Metrics = {
  heights: number[];
  tops: number[];
  headers: Record<string, number>;
};

export type Measured = { atoms: readonly Atom[]; metrics: Metrics };
export type PlacedAtom = { atom: Atom; first: boolean; withHeader: boolean };
export type TocEntry = {
  key: string;
  level: 1 | 2;
  label: string;
  title: string;
  page: number;
};

export type Layout = {
  pages: PlacedAtom[][];
  toc: TocEntry[];
  tocPages: number;
  firstBodyPage: number;
  totalPages: number;
  oversize: boolean;
};

export function buildAtoms(doc: ProposalDocument): Atom[] {
  const atoms: Atom[] = [];

  for (const item of doc.content) {
    switch (item.kind) {
      case "heading":
        atoms.push({
          key: item.id,
          kind: "heading",
          level: item.level,
          label: item.label,
          title: item.title,
        });
        break;
      case "caption":
        atoms.push({ key: item.id, kind: "caption", text: item.text });
        break;
      case "paragraph":
        atoms.push({ key: item.id, kind: "paragraph", text: item.text });
        break;
      case "note":
        atoms.push({ key: item.id, kind: "note", text: item.text });
        break;
      case "list":
        item.items.forEach((entry, index) =>
          atoms.push({
            key: `${item.id}-${index}`,
            kind: "item",
            marker: item.ordered ? `${index + 1}.` : "\u2022",
            lead: entry.lead,
            text: entry.text,
          }),
        );
        break;
      case "table": {
        const { table } = item;
        table.rows.forEach((_, index) =>
          atoms.push({
            key: `${item.id}-r${index}`,
            kind: "row",
            table,
            index,
            last: index === table.rows.length - 1 && table.foot.length === 0,
          }),
        );
        table.foot.forEach((_, index) =>
          atoms.push({
            key: `${item.id}-f${index}`,
            kind: "foot",
            table,
            index,
            last: index === table.foot.length - 1,
          }),
        );
        break;
      }
      case "compare":
        atoms.push({
          key: item.id,
          kind: "compare",
          left: item.left,
          right: item.right,
        });
        break;
    }
  }

  atoms.push({ key: "closing", kind: "closing", closing: doc.closing });
  return atoms;
}

const leads = (atom: Atom): boolean =>
  atom.kind === "heading" || atom.kind === "caption";

export function layoutDocument(
  doc: ProposalDocument,
  atoms: readonly Atom[],
  metrics: Metrics,
): Layout {
  const headingCount = atoms.filter((atom) => atom.kind === "heading").length;
  const tocPages = doc.showToc
    ? Math.max(1, Math.ceil(headingCount / TOC_LINES))
    : 0;
  const firstBodyPage = 2 + tocPages;

  const headerOf = (atom: Atom): number =>
    atom.kind === "row" || atom.kind === "foot"
      ? (metrics.headers[atom.table.id] ?? 0)
      : 0;

  const cost = (index: number, atTop: boolean) => {
    const atom = atoms[index];
    if (!atom) return { height: 0, withHeader: false };
    const tabular = atom.kind === "row" || atom.kind === "foot";
    const withHeader =
      tabular && (atTop || (atom.kind === "row" && atom.index === 0));
    const height =
      (metrics.heights[index] ?? 0) -
      (atTop ? (metrics.tops[index] ?? 0) : 0) +
      (withHeader ? headerOf(atom) : 0);
    return { height, withHeader };
  };

  let page: PlacedAtom[] = [];
  const pages: PlacedAtom[][] = [page];
  let used = 0;
  let oversize = false;

  atoms.forEach((atom, index) => {
    let atTop = page.length === 0;
    let { height, withHeader } = cost(index, atTop);
    let need = height;

    if (leads(atom)) {
      for (let next = index + 1; next < atoms.length; next += 1) {
        const following = atoms[next];
        if (!following) break;
        need += cost(next, false).height;
        if (!leads(following)) break;
      }
    }

    if (!atTop && used + need > CONTENT_H) {
      page = [];
      pages.push(page);
      used = 0;
      atTop = true;
      ({ height, withHeader } = cost(index, true));
    }

    if (height > CONTENT_H) oversize = true;
    page.push({ atom, first: atTop, withHeader });
    used += height;
  });

  const toc: TocEntry[] = [];
  pages.forEach((placed, pageIndex) =>
    placed.forEach(({ atom }) => {
      if (atom.kind === "heading") {
        toc.push({
          key: atom.key,
          level: atom.level,
          label: atom.label,
          title: atom.title,
          page: firstBodyPage + pageIndex,
        });
      }
    }),
  );

  return {
    pages,
    toc,
    tocPages,
    firstBodyPage,
    totalPages: firstBodyPage - 1 + pages.length,
    oversize,
  };
}
