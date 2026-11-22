import { AlignmentType, BorderStyle, Packer, Paragraph } from "docx";
import type { ProposalDocument } from "@/lib/proposal/document";
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
  metaTable,
  newDocument,
  para,
  sectionTitle,
  signatureRun,
  spacer,
  text,
  totalsTable,
} from "./kit";

const SIGN_LINE = new Paragraph({
  children: [],
  spacing: { before: 0, after: 60 },
  border: {
    top: { style: BorderStyle.SINGLE, size: 6, color: COLOR.ink, space: 1 },
  },
});

export async function buildProposalDocx(doc: ProposalDocument): Promise<Blob> {
  const { labels } = doc;
  const signature = await signatureRun(doc.signature.image, 200, 62);

  const phaseWidths = [700, CONTENT_W - 2500, 1800] as const;
  const phasesTable =
    doc.phases.length > 0
      ? grid(phaseWidths, [
          [
            cell([para([])], phaseWidths[0]),
            cell([label(labels.phase)], phaseWidths[1]),
            cell(
              [label(labels.duration, { align: AlignmentType.RIGHT })],
              phaseWidths[2],
              {
                right: 0,
              },
            ),
          ],
          ...doc.phases.map((phase) => [
            cell(
              [para([text(phase.index, { mono: true, size: 20 })])],
              phaseWidths[0],
              { rule: true, top: 120, bottom: 120 },
            ),
            cell(
              [
                para([text(phase.title, { bold: true, size: 23 })]),
                ...(phase.description
                  ? [
                      para(lines(phase.description, { size: 19 }), {
                        before: 30,
                      }),
                    ]
                  : []),
              ],
              phaseWidths[1],
              { rule: true, top: 120, bottom: 120 },
            ),
            cell(
              [
                para([text(phase.duration, { mono: true, size: 20 })], {
                  align: AlignmentType.RIGHT,
                }),
              ],
              phaseWidths[2],
              { rule: true, top: 120, bottom: 120, right: 0 },
            ),
          ]),
        ])
      : null;

  const itemWidths = [CONTENT_W - 2400, 2400] as const;
  const itemsTable = grid(itemWidths, [
    [
      cell([label(labels.description)], itemWidths[0]),
      cell(
        [label(labels.amount, { align: AlignmentType.RIGHT })],
        itemWidths[1],
        {
          right: 0,
        },
      ),
    ],
    ...doc.items.map((item) => [
      cell(
        [
          para([text(item.title, { bold: true, size: 24 })]),
          ...(item.description
            ? [para(lines(item.description, { size: 19 }), { before: 30 })]
            : []),
        ],
        itemWidths[0],
        { rule: true, top: 120, bottom: 120 },
      ),
      cell(
        [
          para([text(item.amountText, { mono: true, size: 20 })], {
            align: AlignmentType.RIGHT,
          }),
        ],
        itemWidths[1],
        { rule: true, top: 120, bottom: 120, right: 0 },
      ),
    ]),
  ]);

  const stepWidths = [CONTENT_W - 3400, 1000, 2400] as const;
  const scheduleTable =
    doc.schedule.length > 0
      ? grid(
          stepWidths,
          doc.schedule.map((step) => [
            cell(
              [
                para([text(step.label, { bold: true, size: 22 })]),
                ...(step.note
                  ? [para(lines(step.note, { size: 19 }), { before: 30 })]
                  : []),
              ],
              stepWidths[0],
              { rule: true, top: 100, bottom: 100 },
            ),
            cell(
              [
                para([text(step.percentText, { mono: true, size: 20 })], {
                  align: AlignmentType.RIGHT,
                }),
              ],
              stepWidths[1],
              { rule: true, top: 100, bottom: 100 },
            ),
            cell(
              [
                para([text(step.amountText, { mono: true, size: 20 })], {
                  align: AlignmentType.RIGHT,
                }),
              ],
              stepWidths[2],
              { rule: true, top: 100, bottom: 100, right: 0 },
            ),
          ]),
        )
      : null;

  const half = Math.floor(CONTENT_W / 2);
  const signSpace = signature
    ? [para([signature], { before: 120 })]
    : [spacer(900)];
  const acceptTable = grid(
    [half, CONTENT_W - half],
    [
      [
        cell(
          [
            label(labels.provider),
            ...signSpace,
            SIGN_LINE,
            para([text(doc.signature.name, { size: 24 })], { before: 60 }),
            ...(doc.signature.role
              ? [
                  para([
                    text(doc.signature.role, { size: 19, color: COLOR.muted }),
                  ]),
                ]
              : []),
            para(
              [
                text(`${labels.date}: ______________`, {
                  mono: true,
                  size: 17,
                }),
              ],
              {
                before: 200,
              },
            ),
          ],
          half,
          { right: 400 },
        ),
        cell(
          [
            label(labels.client),
            spacer(900),
            SIGN_LINE,
            para([text(doc.client.name, { size: 24 })], { before: 60 }),
            para(
              [
                text(`${labels.date}: ______________`, {
                  mono: true,
                  size: 17,
                }),
              ],
              {
                before: 200,
              },
            ),
          ],
          CONTENT_W - half,
          { right: 0 },
        ),
      ],
    ],
  );

  const children = [
    headerTable({
      sender: doc.sender,
      word: labels.proposal,
      subtitle: doc.subtitle,
      numberLabel: labels.number,
      number: doc.number,
    }),
    spacer(480),
    metaTable([
      [
        label(labels.to, { before: 220 }),
        para([text(doc.client.name, { bold: true, size: 26 })], { before: 40 }),
        ...(doc.client.address
          ? [para(lines(doc.client.address, { size: 18 }), { before: 40 })]
          : []),
      ],
      [
        ...fieldParas(labels.issued, doc.issueDate),
        ...fieldParas(labels.validUntil, doc.validUntil, {
          size: 22,
          bold: true,
          color: COLOR.due,
        }),
      ],
      doc.meta.flatMap((field) => fieldParas(field.label, field.value)),
    ]),
    ...(doc.projectTitle
      ? [
          spacer(440),
          label(labels.project, { keepNext: true }),
          para([text(doc.projectTitle, { bold: true, size: 44 })], {
            before: 60,
            keepNext: true,
          }),
        ]
      : []),
    ...(doc.summary
      ? [
          para(lines(doc.summary, { size: 21 }), {
            before: doc.projectTitle ? 160 : 440,
          }),
        ]
      : []),
    ...(doc.blocks.length > 0
      ? [spacer(360), ...blocksContent(doc.blocks)]
      : []),
    ...(phasesTable ? [sectionTitle(labels.timeline), phasesTable] : []),
    sectionTitle(labels.investment),
    itemsTable,
    spacer(240),
    totalsTable(doc.totals),
    ...(scheduleTable ? [sectionTitle(labels.schedule), scheduleTable] : []),
    ...(doc.terms
      ? [sectionTitle(labels.terms), para(lines(doc.terms, { size: 18 }))]
      : []),
    sectionTitle(labels.acceptance, 640),
    ...(doc.closing
      ? [para(lines(doc.closing, { size: 20 }), { after: 200 })]
      : []),
    acceptTable,
  ];

  return Packer.toBlob(newDocument(doc.number, doc.sender.name, children));
}
