export const PROPOSAL_LABELS = {
  proposal: "Proposal",
  number: "No.",
  to: "Diajukan kepada",
  issued: "Tanggal",
  validUntil: "Berlaku hingga",
  project: "Proyek",
  timeline: "Jadwal pengerjaan",
  phase: "Fase",
  duration: "Durasi",
  investment: "Investasi",
  description: "Keterangan",
  amount: "Jumlah",
  subtotal: "Subtotal",
  total: "Total investasi",
  schedule: "Jadwal pembayaran",
  terms: "Syarat & ketentuan",
  acceptance: "Persetujuan",
  provider: "Penyedia jasa",
  client: "Klien",
  date: "Tanggal",
} as const;

export type ProposalLabels = typeof PROPOSAL_LABELS;
