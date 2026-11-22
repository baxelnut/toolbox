import type { Counters } from "@/lib/invoice/types";
import type { ProposalSettings } from "@/lib/proposal";

export const DEFAULT_PROPOSAL_SETTINGS: ProposalSettings = {
  numberPattern: "PRP/{YYYY}/{MMR}/{SEQ}",
};

export const INITIAL_PROPOSAL_COUNTERS: Counters = {};
