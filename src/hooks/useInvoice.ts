import { useEffect, useState } from "react";
import { DEFAULT_PROFILE, INITIAL_COUNTERS } from "@/data/invoice";
import { addDays, diffDays, isIsoDate } from "@/lib/invoice/format";
import {
  loadCounters,
  loadDraft,
  loadProfile,
  saveCounters,
  saveDraft,
  saveProfile,
} from "@/lib/invoice/storage";
import {
  buildTemplate,
  createDraft,
  makeAdjustment,
  makeBlock,
  makeItem,
  makeMeta,
  nextSequence,
} from "@/lib/invoice/templates";
import type {
  Adjustment,
  Block,
  Counters,
  InvoiceDraft,
  LineItem,
  MetaField,
  Profile,
  TemplateId,
} from "@/lib/invoice/types";

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

export function useInvoice() {
  const [boot] = useState(() => {
    const counters = loadCounters(INITIAL_COUNTERS);
    return {
      counters,
      draft: loadDraft() ?? createDraft("retainer", counters),
    };
  });
  const [draft, setDraft] = useState<InvoiceDraft>(boot.draft);
  const [counters, setCounters] = useState<Counters>(boot.counters);
  const [profile, setProfile] = useState<Profile>(() =>
    loadProfile(DEFAULT_PROFILE),
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

  const year = draft.issueDate.slice(0, 4);
  const lastIssued = counters[year] ?? 0;
  const nextFree = lastIssued + 1;
  const dueDate = addDays(draft.issueDate, draft.termDays);

  const set = <K extends keyof InvoiceDraft>(key: K, value: InvoiceDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const setProfileField = <K extends keyof Profile>(
    key: K,
    value: Profile[K],
  ) => setProfile((prev) => ({ ...prev, [key]: value }));

  const setIssueDate = (value: string) => {
    if (!isIsoDate(value)) return;
    setDraft((prev) => {
      const yearChanged = prev.issueDate.slice(0, 4) !== value.slice(0, 4);
      return {
        ...prev,
        issueDate: value,
        seq: yearChanged ? nextSequence(counters, value) : prev.seq,
      };
    });
  };

  const setDueDate = (value: string) => {
    if (!isIsoDate(value)) return;
    set("termDays", Math.max(0, diffDays(draft.issueDate, value)));
  };

  const applyTemplate = (id: TemplateId) =>
    setDraft((prev) => ({
      ...prev,
      templateId: id,
      ...buildTemplate(id, prev.issueDate),
    }));

  const markPrinted = () => setDraft((prev) => ({ ...prev, printed: true }));

  const newInvoice = () => {
    const consumed = draft.printed && draft.numberOverride.trim() === "";
    const next = consumed
      ? { ...counters, [year]: Math.max(counters[year] ?? 0, draft.seq) }
      : counters;
    setCounters(next);
    setDraft(createDraft(draft.templateId, next));
  };

  const issues: string[] = [];
  if (!profile.name.trim()) issues.push("Add your name under Your details.");
  if (!profile.accountNumber.trim()) {
    issues.push("Add your bank details under Your details.");
  }
  if (!draft.clientName.trim()) issues.push("Add the client name.");
  if (!draft.items.some((item) => item.amount !== 0)) {
    issues.push("Add an amount to at least one item.");
  }

  return {
    draft,
    profile,
    lastIssued,
    nextFree,
    dueDate,
    issues,
    set,
    setProfileField,
    setIssueDate,
    setDueDate,
    applyTemplate,
    markPrinted,
    newInvoice,
    items: rowOps<LineItem>(
      (change) => setDraft((prev) => ({ ...prev, items: change(prev.items) })),
      makeItem,
    ),
    adjustments: rowOps<Adjustment>(
      (change) =>
        setDraft((prev) => ({
          ...prev,
          adjustments: change(prev.adjustments),
        })),
      makeAdjustment,
    ),
    blocks: rowOps<Block>(
      (change) =>
        setDraft((prev) => ({ ...prev, blocks: change(prev.blocks) })),
      makeBlock,
    ),
    meta: rowOps<MetaField>(
      (change) => setDraft((prev) => ({ ...prev, meta: change(prev.meta) })),
      makeMeta,
    ),
  };
}

export type InvoiceController = ReturnType<typeof useInvoice>;
