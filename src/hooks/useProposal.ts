import { useEffect, useState } from "react";
import { DEFAULT_PROFILE } from "@/data/invoice";
import {
  DEFAULT_PROPOSAL_SETTINGS,
  INITIAL_PROPOSAL_COUNTERS,
} from "@/data/proposal";
import { addDays, diffDays, isIsoDate } from "@/lib/invoice/format";
import { loadProfile, saveProfile } from "@/lib/invoice/storage";
import { makeAdjustment, makeBlock, makeMeta } from "@/lib/invoice/templates";
import type {
  Adjustment,
  Block,
  Counters,
  MetaField,
  Profile,
} from "@/lib/invoice/types";
import { percentSum } from "@/lib/proposal/calc";
import {
  loadCounters,
  loadDraft,
  loadSettings,
  saveCounters,
  saveDraft,
  saveSettings,
} from "@/lib/proposal/storage";
import {
  buildTemplate,
  createProposalDraft,
  makePayStep,
  makePhase,
  makePriceItem,
  nextProposalSequence,
} from "@/lib/proposal/templates";
import type {
  PayStep,
  Phase,
  PriceItem,
  ProposalDraft,
  ProposalSettings,
  ProposalTemplateId,
} from "@/lib/proposal/types";

type RowUpdater<T> = (change: (rows: T[]) => T[]) => void;

function rowOps<T extends { id: string }>(
  update: RowUpdater<T>,
  create: () => T,
) {
  return {
    add: () => update((rows) => [...rows, create()]),
    update: (id: string, patch: Partial<T>) =>
      update((rows) =>
        rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
      ),
    remove: (id: string) =>
      update((rows) => rows.filter((row) => row.id !== id)),
  };
}

export function useProposal() {
  const [boot] = useState(() => {
    const counters = loadCounters(INITIAL_PROPOSAL_COUNTERS);
    return {
      counters,
      draft: loadDraft() ?? createProposalDraft("build", counters),
    };
  });
  const [draft, setDraft] = useState<ProposalDraft>(boot.draft);
  const [counters, setCounters] = useState<Counters>(boot.counters);
  const [profile, setProfile] = useState<Profile>(() =>
    loadProfile(DEFAULT_PROFILE),
  );
  const [settings, setSettings] = useState<ProposalSettings>(() =>
    loadSettings(DEFAULT_PROPOSAL_SETTINGS),
  );

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    saveCounters(counters);
  }, [counters]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const year = draft.issueDate.slice(0, 4);
  const lastIssued = counters[year] ?? 0;
  const nextFree = lastIssued + 1;
  const validUntil = addDays(draft.issueDate, draft.validDays);

  const set = <K extends keyof ProposalDraft>(
    key: K,
    value: ProposalDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const setProfileField = <K extends keyof Profile>(
    key: K,
    value: Profile[K],
  ) => setProfile((prev) => ({ ...prev, [key]: value }));

  const setNumberPattern = (value: string) =>
    setSettings((prev) => ({ ...prev, numberPattern: value }));

  const setIssueDate = (value: string) => {
    if (!isIsoDate(value)) return;
    setDraft((prev) => {
      const yearChanged = prev.issueDate.slice(0, 4) !== value.slice(0, 4);
      return {
        ...prev,
        issueDate: value,
        seq: yearChanged ? nextProposalSequence(counters, value) : prev.seq,
      };
    });
  };

  const setValidUntil = (value: string) => {
    if (!isIsoDate(value)) return;
    set("validDays", Math.max(0, diffDays(draft.issueDate, value)));
  };

  const applyTemplate = (id: ProposalTemplateId) =>
    setDraft((prev) => ({ ...prev, templateId: id, ...buildTemplate(id) }));

  const markPrinted = () => setDraft((prev) => ({ ...prev, printed: true }));

  const newProposal = () => {
    const consumed = draft.printed && draft.numberOverride.trim() === "";
    const next = consumed
      ? { ...counters, [year]: Math.max(counters[year] ?? 0, draft.seq) }
      : counters;
    setCounters(next);
    setDraft(createProposalDraft(draft.templateId, next));
  };

  const issues: string[] = [];
  if (!profile.name.trim()) issues.push("Add your name under Your details.");
  if (!draft.clientName.trim()) issues.push("Add the client name.");
  if (!draft.items.some((item) => item.amount !== 0)) {
    issues.push("Add a price to at least one item.");
  }
  if (draft.payments.length > 0) {
    const sum = percentSum(draft.payments);
    if (sum !== 100) issues.push(`Payment steps add up to ${sum}%, not 100%.`);
  }

  return {
    draft,
    profile,
    settings,
    lastIssued,
    nextFree,
    validUntil,
    issues,
    set,
    setProfileField,
    setNumberPattern,
    setIssueDate,
    setValidUntil,
    applyTemplate,
    markPrinted,
    newProposal,
    meta: rowOps<MetaField>(
      (change) => setDraft((prev) => ({ ...prev, meta: change(prev.meta) })),
      makeMeta,
    ),
    blocks: rowOps<Block>(
      (change) =>
        setDraft((prev) => ({ ...prev, blocks: change(prev.blocks) })),
      makeBlock,
    ),
    phases: rowOps<Phase>(
      (change) =>
        setDraft((prev) => ({ ...prev, phases: change(prev.phases) })),
      makePhase,
    ),
    items: rowOps<PriceItem>(
      (change) => setDraft((prev) => ({ ...prev, items: change(prev.items) })),
      makePriceItem,
    ),
    adjustments: rowOps<Adjustment>(
      (change) =>
        setDraft((prev) => ({
          ...prev,
          adjustments: change(prev.adjustments),
        })),
      makeAdjustment,
    ),
    payments: rowOps<PayStep>(
      (change) =>
        setDraft((prev) => ({ ...prev, payments: change(prev.payments) })),
      makePayStep,
    ),
  };
}

export type ProposalController = ReturnType<typeof useProposal>;
