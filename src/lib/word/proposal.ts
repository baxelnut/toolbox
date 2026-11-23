import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableOfContents,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  type ImageRun,
} from "docx";
import type {
  Align,
  Content,
  ProposalDocument,
  TableData,
} from "@/lib/proposal/document";
import { signatureRun } from "./kit";

type Item = Paragraph | Table | TableOfContents;
type TextAlign = (typeof AlignmentType)[keyof typeof AlignmentType];

const FONT = "Times New Roman";
const PAGE = { width: 11906, height: 16838, margin: 1417 } as const;
const WIDTH = PAGE.width - PAGE.margin * 2;
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "000000" } as const;
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } as const;

const ALIGN: Record<Align, TextAlign> = {
  left: AlignmentType.LEFT,
  right: AlignmentType.RIGHT,
  center: AlignmentType.CENTER,
};

type RunOpts = {
  bold?: boolean;
  italics?: boolean;
  size?: number;
  caps?: boolean;
};
type ParaOpts = {
  align?: TextAlign;
  before?: number;
  after?: number;
  keepNext?: boolean;
  left?: number;
};

function runProps(opts: RunOpts) {
  return {
    font: FONT,
    size: opts.size ?? 22,
    bold: opts.bold ?? false,
    italics: opts.italics ?? false,
    allCaps: opts.caps ?? false,
  };
}

function runs(text: string, opts: RunOpts = {}): TextRun[] {
  return text.split("\n").map(
    (line, index) =>
      new TextRun({
        text: line,
        ...runProps(opts),
        ...(index > 0 ? { break: 1 } : {}),
      }),
  );
}

function para(
  children: readonly (TextRun | ImageRun)[],
  opts: ParaOpts = {},
): Paragraph {
  return new Paragraph({
    children: [...children],
    alignment: opts.align ?? AlignmentType.LEFT,
    keepNext: opts.keepNext ?? false,
    spacing: { before: opts.before ?? 0, after: opts.after ?? 0, line: 300 },
    ...(opts.left ? { indent: { left: opts.left } } : {}),
  });
}

function spacer(after = 120): Paragraph {
  return new Paragraph({ children: [], spacing: { before: 0, after } });
}

function widthsOf(percents: readonly number[]): number[] {
  const sum = percents.reduce((acc, value) => acc + value, 0) || 1;
  const raw = percents.map((value) => Math.floor((WIDTH * value) / sum));
  const fix = WIDTH - raw.reduce((acc, value) => acc + value, 0);
  return raw.map((value, index) =>
    index === raw.length - 1 ? value + fix : value,
  );
}

function cell(
  children: readonly Paragraph[],
  width: number,
  opts: { fill?: string; span?: number; borders?: boolean } = {},
): TableCell {
  const edge = (opts.borders ?? true) ? BORDER : NONE;
  return new TableCell({
    children: children.length > 0 ? [...children] : [para([])],
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.TOP,
    borders: { top: edge, bottom: edge, left: edge, right: edge },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    ...(opts.span ? { columnSpan: opts.span } : {}),
    ...(opts.fill
      ? { shading: { fill: opts.fill, type: ShadingType.CLEAR, color: "auto" } }
      : {}),
  });
}

function grid(widths: readonly number[], rows: readonly TableRow[]): Table {
  return new Table({
    width: {
      size: widths.reduce((acc, value) => acc + value, 0),
      type: WidthType.DXA,
    },
    columnWidths: [...widths],
    layout: TableLayoutType.FIXED,
    rows: [...rows],
  });
}

function dataTable(table: TableData): Table {
  const widths = widthsOf(table.columns.map((column) => column.width));
  const count = widths.length;

  const head = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: table.columns.map((column, index) =>
      cell(
        [
          para(runs(column.title, { bold: true, size: 21 }), {
            align: ALIGN[column.align],
          }),
        ],
        widths[index] ?? 0,
        { fill: "EEEEEE" },
      ),
    ),
  });

  const body = table.rows.map(
    (row) =>
      new TableRow({
        cantSplit: true,
        children: row.map((value, index) =>
          cell(
            [
              para(runs(value, { size: 21 }), {
                align: ALIGN[table.columns[index]?.align ?? "left"],
              }),
            ],
            widths[index] ?? 0,
          ),
        ),
      }),
  );

  const spanWidth = widths
    .slice(0, Math.max(1, count - 1))
    .reduce((a, b) => a + b, 0);
  const foot = table.foot.map(
    (row) =>
      new TableRow({
        cantSplit: true,
        children: [
          cell([para(runs(row.label, { bold: true, size: 21 }))], spanWidth, {
            span: Math.max(1, count - 1),
          }),
          cell(
            [
              para(runs(row.value, { bold: true, size: 21 }), {
                align: AlignmentType.RIGHT,
              }),
            ],
            widths[count - 1] ?? 0,
          ),
        ],
      }),
  );

  return grid(widths, [head, ...body, ...foot]);
}

function compareTable(left: Content & { kind: "compare" }): Table {
  const half = Math.floor(WIDTH / 2);
  const rest = WIDTH - half;
  const side = (items: readonly string[]) =>
    items.map((item) => para(runs(`- ${item}`, { size: 21 }), { after: 40 }));

  return grid(
    [half, rest],
    [
      new TableRow({
        cantSplit: true,
        children: [
          cell([para(runs(left.left.title, { bold: true, size: 21 }))], half, {
            fill: "EEEEEE",
          }),
          cell([para(runs(left.right.title, { bold: true, size: 21 }))], rest, {
            fill: "EEEEEE",
          }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          cell(side(left.left.items), half),
          cell(side(left.right.items), rest),
        ],
      }),
    ],
  );
}

type State = { firstHeading: boolean; instance: number; toc: boolean };

function convert(item: Content, state: State): Item[] {
  switch (item.kind) {
    case "heading": {
      const breakBefore = state.firstHeading && item.level === 1 && state.toc;
      if (item.level === 1) state.firstHeading = false;
      return [
        new Paragraph({
          heading:
            item.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
          pageBreakBefore: breakBefore,
          children: [
            new TextRun({
              text: `${item.label} ${item.title}`,
              font: FONT,
              bold: true,
              size: item.level === 1 ? 28 : 24,
            }),
          ],
        }),
      ];
    }
    case "caption":
      return [
        para(runs(item.text, { bold: true }), {
          before: 120,
          after: 80,
          keepNext: true,
        }),
      ];
    case "paragraph":
      return [
        para(runs(item.text), { align: AlignmentType.JUSTIFIED, after: 120 }),
      ];
    case "note":
      return [
        para(runs(item.text, { italics: true, size: 20 }), {
          align: AlignmentType.JUSTIFIED,
          before: 40,
          after: 160,
        }),
      ];
    case "list": {
      state.instance += 1;
      const instance = state.instance;
      return item.items.flatMap((entry) => {
        const detailed = entry.lead !== "" && entry.text !== "";
        const head = new Paragraph({
          children: runs(entry.lead || entry.text, { bold: entry.lead !== "" }),
          numbering: item.ordered
            ? { reference: "num", level: 0, instance }
            : { reference: "bullet", level: 0 },
          keepNext: detailed,
          spacing: { before: 0, after: detailed ? 20 : 80, line: 300 },
        });
        return detailed
          ? [
              head,
              para(runs(entry.text), {
                align: AlignmentType.JUSTIFIED,
                left: 720,
                after: 100,
              }),
            ]
          : [head];
      });
    }
    case "table":
      return [dataTable(item.table), spacer()];
    case "compare":
      return [compareTable(item), spacer()];
  }
}

export async function buildProposalDocx(doc: ProposalDocument): Promise<Blob> {
  const [logo, sign] = await Promise.all([
    signatureRun(doc.cover.logo, 230, 230),
    signatureRun(doc.closing.provider.image, 200, 62),
  ]);

  const { cover, closing } = doc;
  const centered = (text: string, opts: RunOpts & ParaOpts = {}) =>
    para(runs(text, opts), { ...opts, align: AlignmentType.CENTER });

  const coverItems: Item[] = [
    ...cover.title.map((line, index) =>
      centered(line, {
        bold: true,
        size: 32,
        caps: true,
        before: index === 0 ? 1400 : 0,
      }),
    ),
    ...(logo
      ? [para([logo], { align: AlignmentType.CENTER, before: 900 })]
      : []),
    centered(cover.client, {
      bold: true,
      caps: true,
      size: 26,
      before: logo ? 1300 : 3000,
    }),
    ...(cover.unit ? [centered(cover.unit, { size: 24 })] : []),
    centered(cover.byLabel, { size: 24, before: 1500 }),
    centered(cover.provider, { bold: true, caps: true, size: 24 }),
    ...(cover.providerRole ? [centered(cover.providerRole, { size: 24 })] : []),
    centered(cover.date, { size: 24, before: 1100 }),
    ...(cover.numberText ? [centered(cover.numberText, { size: 22 })] : []),
  ];

  const state: State = { firstHeading: true, instance: 0, toc: doc.showToc };

  const half = Math.floor(WIDTH / 2);
  const signSpace = sign ? [para([sign], { before: 120 })] : [spacer(1100)];
  const closingTable = grid(
    [half, WIDTH - half],
    [
      new TableRow({
        cantSplit: true,
        children: [
          cell(
            [
              centered(closing.leftLabel),
              ...signSpace.map((item) =>
                item instanceof Paragraph && sign
                  ? para([sign], { align: AlignmentType.CENTER, before: 120 })
                  : item,
              ),
              centered(closing.provider.name, { bold: true, caps: true }),
              centered(closing.provider.role),
            ],
            half,
            { borders: false },
          ),
          cell(
            [
              centered(closing.rightLabel),
              spacer(1100),
              centered(closing.approver.name, { bold: true, caps: true }),
              centered(closing.approver.role),
            ],
            WIDTH - half,
            { borders: false },
          ),
        ],
      }),
    ],
  );

  const body: Item[] = [
    ...(doc.showToc
      ? [
          para(runs("DAFTAR ISI", { bold: true, size: 26 }), { after: 240 }),
          new TableOfContents("Daftar Isi", {
            hyperlink: true,
            headingStyleRange: "1-2",
          }),
        ]
      : []),
    ...doc.content.flatMap((item) => convert(item, state)),
    spacer(360),
    closingTable,
  ];

  const bullet = (
    reference: string,
    format: typeof LevelFormat.BULLET | typeof LevelFormat.DECIMAL,
    text: string,
  ) => ({
    reference,
    levels: [
      {
        level: 0,
        format,
        text,
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      },
    ],
  });

  const document = new Document({
    title: cover.title.join(" "),
    creator: cover.provider,
    features: { updateFields: true },
    styles: {
      default: { document: { run: { font: FONT, size: 22 } } },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: FONT, size: 28, bold: true, color: "000000" },
          paragraph: {
            spacing: { before: 360, after: 160 },
            keepNext: true,
            outlineLevel: 0,
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: FONT, size: 24, bold: true, color: "000000" },
          paragraph: {
            spacing: { before: 240, after: 120 },
            keepNext: true,
            outlineLevel: 1,
          },
        },
      ],
    },
    numbering: {
      config: [
        bullet("bullet", LevelFormat.BULLET, "\u2022"),
        bullet("num", LevelFormat.DECIMAL, "%1."),
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: {
              top: PAGE.margin,
              right: PAGE.margin,
              bottom: PAGE.margin,
              left: PAGE.margin,
            },
          },
        },
        children: coverItems,
      },
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: {
              top: PAGE.margin,
              right: PAGE.margin,
              bottom: PAGE.margin,
              left: PAGE.margin,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: runs(doc.headerText, { size: 19 }),
                border: {
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 6,
                    color: "000000",
                    space: 4,
                  },
                },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        },
        children: body,
      },
    ],
  });

  return Packer.toBlob(document);
}
