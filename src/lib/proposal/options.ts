import type { ProposalTemplateId } from "./types";

export const PROPOSAL_TEMPLATE_OPTIONS: readonly {
  value: ProposalTemplateId;
  label: string;
}[] = [
  { value: "build", label: "Project build" },
  { value: "retainer", label: "Retainer (monthly)" },
  { value: "blank", label: "Blank" },
];
