import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  LevelFormat,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import type { SheetBlock, SheetTotal } from "@/lib/invoice/document";

export const PAGE = { width: 11906, height: 16838, margin: 1134 } as const;
export const CONTENT_W = PAGE.width - PAGE.margin * 2;

// Switch text to "Fraunces" and mono to "DM Mono" if those fonts are installed on every machine that opens the file
export const FONT = { text: "Georgia", mono: "Consolas" } as const;

export const COLOR = {
  ink: "111111",
  muted: "666666",
  due: "4C6B3C",
  credit: "14B85A",
  accent: "F08A24",
  rule: "DDDDDD",
} as const;

type Align = (typeof AlignmentType)[keyof typeof AlignmentType];
type Inline = TextRun | ImageRun;
type Block = Paragraph | Table;

export type TextOpts = {
  bold?: boolean;
  italics?: boolean;
  size?: number;
  color?: string;
  mono?: boolean;
  caps?: boolean;
};

export type ParaOpts = {
  align?: Align;
  before?: number;
  after?: number;
  line?: number;
  keepNext?: boolean;
  bar?: boolean;
};

export type CellOpts = {
  rule?: boolean;
  top?: number;
  bottom?: number;
  right?: number;
};

const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } as const;
const BAR = {
  style: BorderStyle.SINGLE,
  size: 18,
  color: COLOR.accent,
  space: 8,
} as const;

function runProps(opts: TextOpts) {
  return {
    font: opts.mono ? FONT.mono : FONT.text,
    size: opts.size ?? 20,
    color: opts.color ?? COLOR.ink,
    bold: opts.bold ?? false,
    italics: opts.italics ?? false,
    allCaps: opts.caps ?? false,
  };
}

export function text(value: string, opts: TextOpts = {}): TextRun {
  return new TextRun({ text: value, ...runProps(opts) });
}

export function lines(value: string, opts: TextOpts = {}): TextRun[] {
  return value.split("\n").map(
    (line, index) =>
      new TextRun({
        text: line,
        ...runProps(opts),
        ...(index > 0 ? { break: 1 } : {}),
      }),
  );
}

export function para(
  children: readonly Inline[],
  opts: ParaOpts = {},
): Paragraph {
  return new Paragraph({
    children: [...children],
    alignment: opts.align ?? AlignmentType.LEFT,
    keepNext: opts.keepNext ?? false,
    keepLines: true,
    spacing: {
      before: opts.before ?? 0,
      after: opts.after ?? 0,
      line: opts.line ?? 270,
    },
    ...(opts.bar ? { border: { left: BAR }, indent: { left: 200 } } : {}),
  });
}

export function label(value: string, opts: ParaOpts = {}): Paragraph {
  return para([text(value, { mono: true, size: 17, caps: true })], opts);
}

export function spacer(before = 0): Paragraph {
  return new Paragraph({ children: [], spacing: { before, after: 0 } });
}

export function sectionTitle(value: string, before = 560): Paragraph {
  return new Paragraph({
    children: [text(value, { mono: true, size: 17, caps: true })],
    keepNext: true,
    spacing: { before, after: 160 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: COLOR.ink,
        space: 4,
      },
    },
  });
}

export function listItem(
  value: string,
  kind: "check" | "dash",
  size = 19,
  bar = false,
): Paragraph {
  return new Paragraph({
    children: [text(value, { size })],
    numbering: { reference: kind, level: 0 },
    keepLines: true,
    spacing: { before: 0, after: 30, line: 260 },
    ...(bar
      ? { border: { left: BAR }, indent: { left: 560, hanging: 260 } }
      : {}),
  });
}

export function cell(
  children: readonly Paragraph[],
  width: number,
  opts: CellOpts = {},
): TableCell {
  return new TableCell({
    children: children.length > 0 ? [...children] : [para([])],
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.TOP,
    borders: {
      top: NONE,
      left: NONE,
      right: NONE,
      bottom: opts.rule
        ? { style: BorderStyle.SINGLE, size: 4, color: COLOR.rule }
        : NONE,
    },
    margins: {
      top: opts.top ?? 0,
      bottom: opts.bottom ?? 0,
      left: 0,
      right: opts.right ?? 120,
    },
  });
}

export function grid(
  widths: readonly number[],
  rows: readonly (readonly TableCell[])[],
): Table {
  return new Table({
    width: { size: widths.reduce((sum, w) => sum + w, 0), type: WidthType.DXA },
    columnWidths: [...widths],
    layout: TableLayoutType.FIXED,
    borders: {
      top: NONE,
      bottom: NONE,
      left: NONE,
      right: NONE,
      insideHorizontal: NONE,
      insideVertical: NONE,
    },
    rows: rows.map(
      (cells) => new TableRow({ children: [...cells], cantSplit: true }),
    ),
  });
}

export function fieldParas(
  title: string,
  value: string,
  valueOpts: TextOpts = { size: 22, bold: true },
): Paragraph[] {
  return [
    label(title, { before: 220 }),
    para([text(value, valueOpts)], { before: 40 }),
  ];
}

export function headerTable(args: {
  sender: { name: string; contact: string[] };
  word: string;
  subtitle: string;
  numberLabel: string;
  number: string;
}): Table {
  const rightW = 3400;
  const leftW = CONTENT_W - rightW;

  const left = [
    para([text(args.sender.name, { size: 32 })], { before: 520 }),
    ...args.sender.contact.map((line, index) =>
      para([text(line, { size: 18, bold: true })], {
        before: index === 0 ? 100 : 0,
      }),
    ),
  ];

  const right = [
    para([text(args.word, { size: 56 })], { align: AlignmentType.RIGHT }),
    ...(args.subtitle
      ? [
          para([text(args.subtitle, { mono: true, size: 18 })], {
            align: AlignmentType.RIGHT,
            before: 100,
          }),
        ]
      : []),
    label(args.numberLabel, { align: AlignmentType.RIGHT, before: 380 }),
    para([text(args.number, { mono: true, size: 19 })], {
      align: AlignmentType.RIGHT,
      before: 60,
    }),
  ];

  return grid(
    [leftW, rightW],
    [[cell(left, leftW), cell(right, rightW, { right: 0 })]],
  );
}

export function metaTable(
  columns: readonly [Paragraph[], Paragraph[], Paragraph[]],
): Table {
  const widths = [3700, 2700, CONTENT_W - 6400] as const;
  return grid(widths, [
    columns.map((paras, index) =>
      cell(paras, widths[index] ?? 0, { right: index === 2 ? 0 : 200 }),
    ),
  ]);
}

export function totalsTable(rows: readonly SheetTotal[]): Table {
  const labelW = 2900;
  const valueW = 1900;
  const lead = CONTENT_W - labelW - valueW;

  return grid(
    [lead, labelW, valueW],
    rows.map((row) => {
      const total = row.tone === "total";
      const color = row.tone === "credit" ? COLOR.credit : COLOR.ink;
      const before = total ? 100 : 40;
      return [
        cell([para([])], lead),
        cell(
          [
            para([text(row.label, { bold: true, size: total ? 26 : 20 })], {
              before,
              after: 40,
            }),
          ],
          labelW,
        ),
        cell(
          [
            para(
              [
                text(row.valueText, {
                  mono: true,
                  size: total ? 24 : 20,
                  color,
                }),
              ],
              {
                align: AlignmentType.RIGHT,
                before,
                after: 40,
              },
            ),
          ],
          valueW,
          { right: 0 },
        ),
      ];
    }),
  );
}

function segmentParas(block: SheetBlock): Paragraph[] {
  const callout = block.kind === "callout";
  const kind = callout ? "dash" : "check";
  const size = callout ? 18 : 19;

  return block.segments.flatMap((segment) =>
    segment.type === "list"
      ? segment.items.map((item) => listItem(item, kind, size, callout))
      : [para(lines(segment.text, { size }), { after: 40, bar: callout })],
  );
}

function renderBlock(block: SheetBlock): Paragraph[] {
  return [
    ...(block.title
      ? [label(block.title, { after: 100, keepNext: true })]
      : []),
    ...segmentParas(block),
  ];
}

export function blocksContent(blocks: readonly SheetBlock[]): Block[] {
  const half = Math.floor(CONTENT_W / 2);
  const rest = CONTENT_W - half;
  const out: Block[] = [];

  const pair = (first: SheetBlock, second: SheetBlock | null): Table =>
    grid(
      [half, rest],
      [
        [
          cell(renderBlock(first), half, { right: 280 }),
          cell(second ? renderBlock(second) : [para([])], rest, { right: 0 }),
        ],
      ],
    );

  let pending: SheetBlock | null = null;

  for (const block of blocks) {
    if (block.width === "half") {
      if (pending) {
        out.push(pair(pending, block), spacer(160));
        pending = null;
      } else {
        pending = block;
      }
      continue;
    }
    if (pending) {
      out.push(pair(pending, null), spacer(160));
      pending = null;
    }
    out.push(...renderBlock(block), spacer(160));
  }

  if (pending) out.push(pair(pending, null), spacer(160));
  return out;
}

export async function signatureRun(
  dataUrl: string,
  maxWidth: number,
  maxHeight: number,
): Promise<ImageRun | null> {
  if (!dataUrl) return null;
  const blob = await (await fetch(dataUrl)).blob();
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height, 1);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  bitmap.close();

  return new ImageRun({
    type: "png",
    data: new Uint8Array(await blob.arrayBuffer()),
    transformation: { width, height },
    altText: {
      title: "Signature",
      description: "Signature",
      name: "signature",
    },
  });
}

function bulletConfig(reference: string, symbol: string) {
  return {
    reference,
    levels: [
      {
        level: 0,
        format: LevelFormat.BULLET,
        text: symbol,
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 260 } } },
      },
    ],
  };
}

export function newDocument(
  title: string,
  creator: string,
  children: readonly Block[],
): Document {
  const footerStyle = { mono: true, size: 15, color: COLOR.muted } as const;
  const props = runProps(footerStyle);

  return new Document({
    title,
    creator,
    styles: {
      default: {
        document: { run: { font: FONT.text, size: 20, color: COLOR.ink } },
      },
    },
    numbering: {
      config: [bulletConfig("check", "\u2713"), bulletConfig("dash", "\u2013")],
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
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  text(`${title}   `, footerStyle),
                  new TextRun({ children: [PageNumber.CURRENT], ...props }),
                  text(" / ", footerStyle),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], ...props }),
                ],
              }),
            ],
          }),
        },
        children: [...children],
      },
    ],
  });
}
