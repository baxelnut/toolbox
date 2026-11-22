export const LABELS = {
  invoice: "Invoice",
  number: "No.",
  billTo: "Tagihan ke",
  issued: "Tanggal terbit",
  due: "Tenggat waktu",
  description: "Keterangan",
  amount: "Jumlah",
  included: "Termasuk:",
  paid: "Lunas",
  payment: "Rincian pembayaran",
  bank: "Bank",
  account: "Account",
  name: "Name",
} as const;

export type Labels = typeof LABELS;
