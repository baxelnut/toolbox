import { todayIso, uid } from "@/lib/invoice/format";
import { makeBlock, makeMeta } from "@/lib/invoice/templates";
import type { Counters } from "@/lib/invoice/types";
import type {
  PayStep,
  Phase,
  PriceItem,
  ProposalContent,
  ProposalDraft,
  ProposalTemplateId,
} from "./types";

export function makePhase(patch: Partial<Phase> = {}): Phase {
  return { id: uid(), title: "", duration: "", description: "", ...patch };
}

export function makePriceItem(patch: Partial<PriceItem> = {}): PriceItem {
  return { id: uid(), title: "", description: "", amount: 0, ...patch };
}

export function makePayStep(patch: Partial<PayStep> = {}): PayStep {
  return { id: uid(), label: "", percent: 0, note: "", ...patch };
}

const BUILD_TERMS =
  "Uang muka wajib dibayar sebelum pekerjaan dimulai. Pelunasan jatuh tempo dalam waktu 7 hari setelah proyek selesai. Kepemilikan hasil pekerjaan beralih ke klien hanya setelah pembayaran penuh. Proposal ini berlaku selama masa berlaku yang tertera dan menjadi dasar kontrak setelah disetujui kedua pihak.";

const CLOSING =
  "Terima kasih atas kesempatan ini. Tanda tangan di bawah menandakan persetujuan atas lingkup, jadwal, dan biaya di atas.";

const OUT_OF_SCOPE_BUILD = [
  "Hal berikut tidak termasuk dalam proposal ini dan akan diberi penawaran terpisah:",
  "- Fitur atau modul baru",
  "- Perombakan desain atau rebranding",
  "- Integrasi third-party tambahan",
  "- Biaya domain, hosting, dan layanan pihak ketiga",
].join("\n");

const OUT_OF_SCOPE_RETAINER = [
  "Berikut ini berada di luar cakupan retainer bulanan dan akan diberikan invoice terpisah:",
  "- Fitur atau modul baru",
  "- Perombakan desain atau rebranding",
  "- Perubahan model data atau skema",
  "- Integrasi third-party",
  "- Scaling/migrasi infrastruktur",
  "- Pekerjaan yang memerlukan perubahan scope of work",
  "Permintaan di luar scope akan diakui secara tertulis dan penawaran harga terpisah akan diberikan sebelum pekerjaan dimulai.",
].join("\n");

const BUILDERS: Record<ProposalTemplateId, () => ProposalContent> = {
  build: () => ({
    validDays: 14,
    subtitle: "Proposal Pengembangan Sistem",
    meta: [makeMeta({ label: "Estimasi durasi", value: "6 minggu" })],
    summary:
      "Proposal ini mengajukan pengembangan sistem sesuai kebutuhan yang telah didiskusikan. Isinya mencakup lingkup, jadwal, biaya, dan syarat kerja sama.",
    blocks: [
      makeBlock({
        title: "Tujuan proyek",
        kind: "text",
        width: "full",
        body: "Tuliskan masalah yang diselesaikan proyek ini dan hasil yang diharapkan klien.",
      }),
      makeBlock({
        title: "Lingkup pekerjaan",
        kind: "checklist",
        body: [
          "Desain UI dasbor & pengembangan frontend",
          "Integrasi API backend",
          "Komponen visualisasi data",
          "Hingga 3 putaran revisi",
          "Penyerahan source file setelah pembayaran akhir",
        ].join("\n"),
      }),
      makeBlock({
        title: "Hasil akhir",
        kind: "checklist",
        body: [
          "Sistem siap pakai",
          "Source file",
          "Dokumentasi singkat penggunaan",
        ].join("\n"),
      }),
      makeBlock({
        title: "Di luar lingkup",
        kind: "callout",
        width: "full",
        body: OUT_OF_SCOPE_BUILD,
      }),
      makeBlock({
        title: "Kebijakan revisi",
        kind: "text",
        width: "full",
        body: "Proposal ini mencakup 3 putaran revisi setelah pengiriman. Revisi tambahan, fitur baru, atau pekerjaan apa pun di luar ruang lingkup yang disepakati akan diberi penawaran dan ditagih secara terpisah.",
      }),
    ],
    phases: [
      makePhase({
        title: "Discovery & desain",
        duration: "1 minggu",
        description: "Konfirmasi kebutuhan, alur, dan desain antarmuka.",
      }),
      makePhase({
        title: "Pengembangan",
        duration: "3 minggu",
        description: "Frontend, integrasi API backend, visualisasi data.",
      }),
      makePhase({
        title: "Review & revisi",
        duration: "1 minggu",
        description: "Hingga 3 putaran revisi.",
      }),
      makePhase({
        title: "Peluncuran & serah terima",
        duration: "1 minggu",
        description: "Deploy, konfigurasi, dan penyerahan source file.",
      }),
    ],
    items: [
      makePriceItem({
        title: "Pengembangan sistem",
        description:
          "Desain, pengembangan, dan peluncuran sesuai lingkup di atas.",
      }),
    ],
    adjustments: [],
    payments: [
      makePayStep({
        label: "Uang muka (DP)",
        percent: 50,
        note: "Dibayar saat persetujuan, sebelum pekerjaan dimulai.",
      }),
      makePayStep({
        label: "Pelunasan",
        percent: 50,
        note: "Dibayar saat penyerahan hasil akhir dan persetujuan klien.",
      }),
    ],
    terms: BUILD_TERMS,
    closing: CLOSING,
  }),

  retainer: () => ({
    validDays: 14,
    subtitle: "Proposal Retainer Maintenance",
    meta: [
      makeMeta({
        label: "Siklus penagihan",
        value: "Bulanan · Tanggal 25 setiap bulan",
      }),
    ],
    summary:
      "Proposal ini mengajukan layanan maintenance bulanan agar sistem tetap berjalan, aman, dan terpantau.",
    blocks: [
      makeBlock({
        title: "Termasuk dalam retainer",
        kind: "checklist",
        width: "full",
        body: [
          "Uptime monitoring & availability checks",
          "Bug fixes & error resolutions",
          "Update keamanan & kerahasiaan data",
          "Performance report bulanan",
        ].join("\n"),
      }),
      makeBlock({
        title: "Tidak termasuk dalam retainer",
        kind: "callout",
        width: "full",
        body: OUT_OF_SCOPE_RETAINER,
      }),
    ],
    phases: [],
    items: [
      makePriceItem({
        title: "Monthly Maintenance Retainer",
        description: "Layanan maintenance per bulan.",
      }),
    ],
    adjustments: [],
    payments: [
      makePayStep({
        label: "Tagihan bulanan",
        percent: 100,
        note: "Diterbitkan tanggal 25 setiap bulan, jatuh tempo 14 hari kalender.",
      }),
    ],
    terms:
      "Tagihan diterbitkan pada tanggal 25 setiap bulan (hari kerja) dan jatuh tempo dalam waktu 14 hari kalender. Pembayaran berlaku bulanan. Keterlambatan pembayaran dapat mengakibatkan penangguhan sementara hingga tagihan dilunasi sepenuhnya.",
    closing: CLOSING,
  }),

  blank: () => ({
    validDays: 14,
    subtitle: "",
    meta: [],
    summary: "",
    blocks: [],
    phases: [],
    items: [makePriceItem()],
    adjustments: [],
    payments: [],
    terms: "",
    closing: "",
  }),
};

export function buildTemplate(id: ProposalTemplateId): ProposalContent {
  return BUILDERS[id]();
}

export function nextProposalSequence(
  counters: Counters,
  issueDate: string,
): number {
  return (counters[issueDate.slice(0, 4)] ?? 0) + 1;
}

export function createProposalDraft(
  templateId: ProposalTemplateId,
  counters: Counters,
  issueDate: string = todayIso(),
): ProposalDraft {
  return {
    templateId,
    seq: nextProposalSequence(counters, issueDate),
    numberOverride: "",
    printed: false,
    issueDate,
    clientName: "",
    clientAddress: "",
    projectTitle: "",
    ...buildTemplate(templateId),
  };
}
