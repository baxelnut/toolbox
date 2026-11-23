import { useEffect, useState } from "react";
import { DEFAULT_PROFILE } from "@/data/invoice";
import {
  DEFAULT_PROPOSAL_SETTINGS,
  INITIAL_PROPOSAL_COUNTERS,
} from "@/data/proposal";
import { isIsoDate } from "@/lib/invoice/format";
import { loadProfile, saveProfile } from "@/lib/invoice/storage";
import type { Counters, Profile } from "@/lib/invoice/types";
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
  makeBlock,
  makeSection,
  nextProposalSequence,
} from "@/lib/proposal/templates";
import type {
  Block,
  BlockType,
  ProposalDraft,
  ProposalSettings,
  ProposalTemplateId,
  Section,
} from "@/lib/proposal/types";

function moveRow<T extends { id: string }>(
  rows: T[],
  id: string,
  step: -1 | 1,
): T[] {
  const index = rows.findIndex((row) => row.id === id);
  const current = rows[index];
  const other = rows[index + step];
  if (index < 0 || !current || !other) return rows;
  const next = [...rows];
  next[index] = other;
  next[index + step] = current;
  return next;
}

export function useProposal() {
  const [boot] = useState(() => {
    const counters = loadCounters(INITIAL_PROPOSAL_COUNTERS);
    return {
      counters,
      draft: loadDraft() ?? createProposalDraft("full", counters),
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
    const timer = window.setTimeout(() => saveDraft(draft), 400);
    return () => window.clearTimeout(timer);
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

  const set = <K extends keyof ProposalDraft>(
    key: K,
    value: ProposalDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const setProfileField = <K extends keyof Profile>(
    key: K,
    value: Profile[K],
  ) => setProfile((prev) => ({ ...prev, [key]: value }));

  const setSetting = <K extends keyof ProposalSettings>(
    key: K,
    value: ProposalSettings[K],
  ) => setSettings((prev) => ({ ...prev, [key]: value }));

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

  const changeSections = (change: (rows: Section[]) => Section[]) =>
    setDraft((prev) => ({ ...prev, sections: change(prev.sections) }));

  const changeBlocks = (
    sectionId: string,
    change: (rows: Block[]) => Block[],
  ) =>
    changeSections((rows) =>
      rows.map((section) =>
        section.id === sectionId
          ? { ...section, blocks: change(section.blocks) }
          : section,
      ),
    );

  return {
    draft,
    profile,
    settings,
    lastIssued,
    nextFree,
    set,
    setProfileField,
    setSetting,
    setIssueDate,
    applyTemplate,
    markPrinted,
    newProposal,
    sections: {
      add: () => changeSections((rows) => [...rows, makeSection("")]),
      rename: (id: string, title: string) =>
        changeSections((rows) =>
          rows.map((row) => (row.id === id ? { ...row, title } : row)),
        ),
      remove: (id: string) =>
        changeSections((rows) => rows.filter((row) => row.id !== id)),
      move: (id: string, step: -1 | 1) =>
        changeSections((rows) => moveRow(rows, id, step)),
    },
    blocks: {
      add: (sectionId: string, type: BlockType) =>
        changeBlocks(sectionId, (rows) => [...rows, makeBlock(type)]),
      update: (sectionId: string, id: string, patch: Partial<Block>) =>
        changeBlocks(sectionId, (rows) =>
          rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        ),
      remove: (sectionId: string, id: string) =>
        changeBlocks(sectionId, (rows) => rows.filter((row) => row.id !== id)),
      move: (sectionId: string, id: string, step: -1 | 1) =>
        changeBlocks(sectionId, (rows) => moveRow(rows, id, step)),
    },
  };
}

export type ProposalController = ReturnType<typeof useProposal>;
