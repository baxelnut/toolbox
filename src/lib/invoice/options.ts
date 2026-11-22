import type {
  AdjustmentKind,
  BlockKind,
  BlockWidth,
  LineStatus,
  NumberFormat,
  TemplateId,
} from "./types";

export const TEMPLATE_OPTIONS: readonly { value: TemplateId; label: string }[] =
  [
    { value: "retainer", label: "Retainer (monthly)" },
    { value: "project-dp", label: "Project: down payment" },
    { value: "project-final", label: "Project: final payment" },
    { value: "blank", label: "Blank" },
  ];

export const STATUS_OPTIONS: readonly { value: LineStatus; label: string }[] = [
  { value: "due", label: "Due now (charged)" },
  { value: "paid", label: "Already paid (credited)" },
  { value: "upcoming", label: "Upcoming (listed only)" },
];

export const ADJUSTMENT_OPTIONS: readonly {
  value: AdjustmentKind;
  label: string;
}[] = [
  { value: "discount", label: "Discount (subtract)" },
  { value: "charge", label: "Charge (add)" },
];

export const KIND_OPTIONS: readonly { value: BlockKind; label: string }[] = [
  { value: "checklist", label: "Checklist" },
  { value: "text", label: "Paragraph" },
  { value: "callout", label: "Callout" },
];

export const WIDTH_OPTIONS: readonly { value: BlockWidth; label: string }[] = [
  { value: "half", label: "Half width" },
  { value: "full", label: "Full width" },
];

export const NUMBER_FORMAT_OPTIONS: readonly {
  value: NumberFormat;
  label: string;
}[] = [
  { value: "comma", label: "1,250,000" },
  { value: "dot", label: "1.250.000" },
];
