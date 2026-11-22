import { AlignmentType, Packer } from "docx";
import type { InvoiceDocument } from "@/lib/invoice/document";
import {
  CONTENT_W,
  COLOR,
  blocksContent,
  cell,
  fieldParas,
  grid,
  headerTable,
  label,
  lines,
  listItem,
  metaTable,
  newDocument,
  para,
  signatureRun,
  spacer,
  text,
  totalsTable,
} from "./kit";

export async function buildInvoiceDocx(doc: InvoiceDocument): Promise<Blob> {
  const { labels } = doc;

  const signature = await signatureRun(doc.signature.image, 200, 62);

  const itemWidths = [CONTENT_W - 3600, 1900, 1700] as const;
  const itemsTable = grid(itemWidths, [
    [
      cell([label(labels.description)], itemWidths[0]),
      cell(
        [label(doc.kindHeader, { align: AlignmentType.CENTER })],
        itemWidths[1],
      ),
      cell(
        [label(labels.amount, { align: AlignmentType.RIGHT })],
        itemWidths[2],
        {
          right: 0,
        },
      ),
    ],
    ...doc.items.map((item) => [
      cell(
        [
          para([text(item.title, { bold: true, size: 24 })], { before: 160 }),
          ...(item.description
            ? [para(lines(item.description, { size: 19 }), { before: 40 })]
            : []),
          ...(item.includes.length > 0
            ? [
                label(labels.included, {
                  before: 100,
                  after: 40,
                  keepNext: true,
                }),
                ...item.includes.map((entry) => listItem(entry, "check")),
              ]
            : []),
        ],
        itemWidths[0],
      ),
      cell(
        [
          para([text(item.kindLabel, { mono: true, size: 20 })], {
            align: AlignmentType.CENTER,
            before: 170,
          }),
        ],
        itemWidths[1],
      ),
      cell(
        [
          para([text(item.amountText, { mono: true, size: 20 })], {
            align: AlignmentType.RIGHT,
            before: 170,
          }),
          ...(item.paidTag
            ? [
                para([text(item.paidTag, { mono: true, size: 20 })], {
                  align: AlignmentType.RIGHT,
                }),
              ]
            : []),
        ],
        itemWidths[2],
        { right: 0 },
      ),
    ]),
  ]);

  const half = Math.floor(CONTENT_W / 2);
  const footTable =
    doc.payment.lines.length > 0 || doc.terms
      ? grid(
          [half, CONTENT_W - half],
          [
            [
              cell(
                [
                  ...(doc.payment.lines.length > 0
                    ? [label(doc.payment.title, { after: 100 })]
                    : []),
                  ...doc.payment.lines.map((line) =>
                    para([
                      text(`${line.label}  ${line.value}`, {
                        bold: true,
                        size: 21,
                      }),
                    ]),
                  ),
                ],
                half,
                { right: 280 },
              ),
              cell(
                doc.terms
                  ? [
                      label(doc.termsTitle, { after: 100 }),
                      para(lines(doc.terms, { size: 18 })),
                    ]
                  : [],
                CONTENT_W - half,
                { right: 0 },
              ),
            ],
          ],
        )
      : null;

  const children = [
    headerTable({
      sender: doc.sender,
      word: labels.invoice,
      subtitle: doc.subtitle,
      numberLabel: labels.number,
      number: doc.number,
    }),
    spacer(560),
    metaTable([
      [
        label(labels.billTo, { before: 220 }),
        para([text(doc.client.name, { bold: true, size: 26 })], { before: 40 }),
        ...(doc.client.address
          ? [para(lines(doc.client.address, { size: 18 }), { before: 40 })]
          : []),
      ],
      [
        ...fieldParas(labels.issued, doc.issueDate),
        ...fieldParas(labels.due, doc.dueDate, {
          size: 22,
          bold: true,
          color: COLOR.due,
        }),
      ],
      doc.meta.flatMap((field) => fieldParas(field.label, field.value)),
    ]),
    spacer(520),
    itemsTable,
    spacer(240),
    totalsTable(doc.totals),
    spacer(440),
    ...(doc.blocks.length > 0 ? blocksContent(doc.blocks) : []),
    ...(doc.legalNote
      ? [
          spacer(240),
          para(lines(doc.legalNote, { mono: true, size: 17 }), { after: 120 }),
        ]
      : []),
    ...(footTable ? [spacer(360), footTable] : []),
    spacer(480),
    ...(signature ? [para([signature], { align: AlignmentType.RIGHT })] : []),
    para([text(doc.signature.name, { size: 26 })], {
      align: AlignmentType.RIGHT,
      before: 60,
    }),
    ...(doc.signature.role
      ? [
          para([text(doc.signature.role, { size: 19, color: COLOR.muted })], {
            align: AlignmentType.RIGHT,
          }),
        ]
      : []),
  ];

  return Packer.toBlob(newDocument(doc.number, doc.sender.name, children));
}
