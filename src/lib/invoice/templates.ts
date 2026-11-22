import { formatMonth, todayIso, uid } from "./format";
import type {
  Adjustment,
  Block,
  Counters,
  DraftContent,
  InvoiceDraft,
  LineItem,
  MetaField,
  TemplateId,
} from "./types";

export function makeItem(patch: Partial<LineItem> = {}): LineItem {
  return {
    id: uid(),
    title: "",
    description: "",
    kindLabel: "",
    amount: 0,
    status: "due",
    includes: "",
    ...patch,
  };
}

export function makeAdjustment(patch: Partial<Adjustment> = {}): Adjustment {
  return { id: uid(), label: "", amount: 0, kind: "discount", ...patch };
}

export function makeBlock(patch: Partial<Block> = {}): Block {
  return {
    id: uid(),
    title: "",
    kind: "text",
    width: "half",
    body: "",
    ...patch,
  };
}

export function makeMeta(patch: Partial<MetaField> = {}): MetaField {
  return { id: uid(), label: "", value: "", ...patch };
}

const BASE_LABELS = {
  subtotalLabel: "Subtotal",
  totalLabel: "Total",
  payNowLabel: "Jumlah dibayar sekarang",
  paidLabel: "Sudah dibayar",
};

const PROJECT_LABELS = {
  subtotalLabel: "Biaya Proyek",
  totalLabel: "Total",
  payNowLabel: "Jumlah dibayar sekarang (DP)",
  paidLabel: "Sudah Dibayar (DP)",
};

const PROJECT_LEGAL =
  "Invoice ini merupakan permintaan pembayaran yang mengikat berdasarkan kontrak proyek yang telah disepakati. Penyedia layanan berhak untuk menangguhkan deliverables atau menahan source file hingga pembayaran penuh diselesaikan.";

const PROJECT_TERMS =
  "Pembayaran uang muka (DP) wajib dilakukan sebelum pekerjaan dimulai. Pembayaran akhir jatuh tempo dalam waktu 7 hari setelah proyek selesai. Kepemilikan hasil pekerjaan beralih ke klien hanya setelah menerima pembayaran penuh.";

function projectBlocks(): Block[] {
  return [
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
      title: "Kebijakan revisi",
      kind: "text",
      body: "Proyek ini mencakup 3 putaran revisi setelah pengiriman. Revisi tambahan, fitur baru, atau pekerjaan apa pun di luar ruang lingkup yang disepakati akan diberi penawaran dan ditagih secara terpisah.",
    }),
  ];
}

function downPaymentItem(patch: Partial<LineItem> = {}): LineItem {
  return makeItem({
    title: "Pengembangan Awal | Uang Muka (DP)",
    description:
      "50% dari total biaya proyek. Dibayarkan pada saat persetujuan kontrak sebelum pekerjaan pengembangan dimulai.",
    kindLabel: "DP · 50%",
    ...patch,
  });
}

function finalItem(patch: Partial<LineItem> = {}): LineItem {
  return makeItem({
    title: "Final Delivery | Penyelesaian Proyek",
    description:
      "Sisa 50% dibayarkan saat penyerahan hasil akhir dan persetujuan klien.",
    kindLabel: "Final · 50%",
    ...patch,
  });
}

const BUILDERS: Record<TemplateId, (issueDate: string) => DraftContent> = {
  retainer: (issueDate) => ({
    termDays: 14,
    subtitle: "Retainer Bulanan",
    kindHeader: "Tipe",
    meta: [
      makeMeta({ label: "Periode penagihan", value: formatMonth(issueDate) }),
      makeMeta({
        label: "Siklus penagihan",
        value: "Bulanan · Tanggal 25 setiap bulan",
      }),
    ],
    items: [
      makeItem({
        title: "Monthly Maintenance Retainer",
        kindLabel: "Maintenance",
        includes: [
          "Uptime monitoring & availability checks",
          "Bug fixes & error resolutions",
          "Update keamanan & kerahasiaan data",
          "Performance report bulanan",
        ].join("\n"),
      }),
    ],
    ...BASE_LABELS,
    adjustments: [],
    blocks: [
      makeBlock({
        title: "Tidak termasuk dalam retainer ini",
        kind: "callout",
        width: "full",
        body: [
          "Berikut ini adalah layanan yang berada di luar cakupan retainer bulanan ini dan akan diberikan invoice terpisah:",
          "- Fitur atau modul baru",
          "- Perombakan desain atau rebranding",
          "- Perubahan model data atau skema",
          "- Integrasi third-party",
          "- Scaling/migrasi infrastruktur",
          "- Pekerjaan yang memerlukan perubahan scope of work",
          "Permintaan di luar scope akan diakui secara tertulis dan penawaran harga terpisah akan diberikan sebelum pekerjaan dimulai.",
        ].join("\n"),
      }),
    ],
    legalNote:
      "Invoice ini mencakup layanan maintenance khusus untuk periode penagihan yang ditentukan. Untuk memastikan layanan tetap berjalan tanpa gangguan, mohon lunasi saldo sebelum tanggal jatuh tempo. Pembayaran yang tertunggak memberikan hak kepada penyedia layanan untuk menangguhkan kegiatan pemeliharaan tanpa kewajiban apa pun hingga tagihan dilunasi.",
    termsTitle: "Syarat pembayaran",
    terms:
      "Tagihan diterbitkan pada tanggal 25 setiap bulan (hari kerja) dan jatuh tempo dalam waktu 14 hari kalender. Pembayaran ini berlaku bulanan. Harap diperhatikan bahwa keterlambatan pembayaran akan mengakibatkan penangguhan sementara hingga tagihan dilunasi sepenuhnya.",
  }),

  "project-dp": () => ({
    termDays: 7,
    subtitle: "One-Time Build Payment",
    kindHeader: "Fase",
    meta: [makeMeta({ label: "Proyek", value: "" })],
    items: [downPaymentItem(), finalItem({ status: "upcoming" })],
    ...PROJECT_LABELS,
    adjustments: [],
    blocks: projectBlocks(),
    legalNote: PROJECT_LEGAL,
    termsTitle: "Syarat & ketentuan",
    terms: PROJECT_TERMS,
  }),

  "project-final": () => ({
    termDays: 7,
    subtitle: "One-Time Build Payment",
    kindHeader: "Fase",
    meta: [makeMeta({ label: "Proyek", value: "" })],
    items: [
      downPaymentItem({ status: "paid" }),
      finalItem(),
      makeItem({
        title: "Custom Domain, Setup & Konfigurasi",
        description:
          "Pembelian nama domain kustom (langganan 1 tahun), setup DNS record, SSL/HTTPS, hingga konfigurasi penuh untuk kelancaran peluncuran (launching).\nNote: Biaya perpanjangan domain bersifat tahunan.",
        kindLabel: "Launching",
      }),
    ],
    ...PROJECT_LABELS,
    totalLabel: "Total (Lunas)",
    adjustments: [],
    blocks: projectBlocks(),
    legalNote: PROJECT_LEGAL,
    termsTitle: "Syarat & ketentuan",
    terms: PROJECT_TERMS,
  }),

  blank: () => ({
    termDays: 14,
    subtitle: "",
    kindHeader: "Tipe",
    meta: [],
    items: [makeItem()],
    ...BASE_LABELS,
    adjustments: [],
    blocks: [],
    legalNote: "",
    termsTitle: "Syarat pembayaran",
    terms: "",
  }),
};

export function buildTemplate(id: TemplateId, issueDate: string): DraftContent {
  return BUILDERS[id](issueDate);
}

export function nextSequence(counters: Counters, issueDate: string): number {
  return (counters[issueDate.slice(0, 4)] ?? 0) + 1;
}

export function createDraft(
  templateId: TemplateId,
  counters: Counters,
  issueDate: string = todayIso(),
): InvoiceDraft {
  return {
    templateId,
    seq: nextSequence(counters, issueDate),
    numberOverride: "",
    printed: false,
    issueDate,
    clientName: "",
    clientAddress: "",
    ...buildTemplate(templateId, issueDate),
  };
}
