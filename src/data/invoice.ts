import type { Counters, Profile } from "@/lib/invoice/types";

const currentYear = new Date().getFullYear();

// Fill in your real details here, or enter them once under "Your details" (saved in this browser)
export const DEFAULT_PROFILE: Profile = {
  name: "Basilius Tengang",
  email: "basilius.tengang.dev@gmail.com",
  phone: "+62 819-7969-067",
  website: "basiliustengang.com",
  bankName: "BCA",
  accountNumber: "389 078 1259",
  accountName: "Basilius Tengang",
  signerName: "Basilius Tengang, S.Kom.",
  signerRole: "Penyedia Jasa & Vendor Sistem",
  signature: "Basilius Tengang",
  numberPattern: `INV/${currentYear}/{MMR}/{SEQ}`,
  numberFormat: "comma",
  currency: "Rp",
};

// Set each year to the number of invoices already issued, the next invoice continues from it
export const INITIAL_COUNTERS: Counters = { "2026": 3 };
