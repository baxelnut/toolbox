import { todayIso, uid } from "@/lib/invoice/format";
import type { Counters } from "@/lib/invoice/types";
import type {
  Block,
  BlockType,
  ProposalContent,
  ProposalDraft,
  ProposalTemplateId,
  Section,
} from "./types";

export function makeBlock(type: BlockType, patch: Partial<Block> = {}): Block {
  return {
    id: uid(),
    type,
    body: "",
    label: "",
    body2: "",
    label2: "",
    counted: type === "cost",
    ...patch,
  };
}

export function makeSection(title = "", blocks: Block[] = []): Section {
  return { id: uid(), title, blocks };
}

const b = (type: BlockType, body = "", patch: Partial<Block> = {}): Block =>
  makeBlock(type, { body, ...patch });
const s = makeSection;

const FULL = (): ProposalContent => ({
  coverTitle:
    "PROPOSAL TEKNIS DAN PENGAJUAN\nPENGEMBANGAN, PELUNCURAN, DAN PENGELOLAAN\n{project}",
  headerText: "{client} | Proposal {project}",
  providerRole: "Penyedia Jasa Pengembangan & Pengelolaan Sistem",
  showToc: true,
  leftLabel: "Diajukan oleh,",
  rightLabel: "Mengetahui dan menyetujui,",
  sections: [
    s("Ringkasan Eksekutif", [
      b(
        "paragraph",
        "Dokumen ini mengusulkan pembangunan {project} bagi {client}. Isinya mencakup latar belakang, ruang lingkup, solusi, jadwal, rencana anggaran biaya, dan ketentuan kerja sama.\n\nTujuan utamanya adalah menggantikan proses manual dengan sistem yang terukur, dapat diaudit, dan layak dipresentasikan kepada pimpinan serta mitra.",
      ),
      b(
        "paragraph",
        "Proposal ini mencakup tiga komponen: (1) investasi pengembangan satu kali hingga sistem siap diluncurkan, (2) biaya infrastruktur pihak ketiga yang menopang operasional, dan (3) layanan pemeliharaan berkelanjutan setelah peluncuran.",
      ),
      b("caption", "Ringkasan Investasi"),
      b(
        "table",
        "Komponen | Nilai\nInvestasi pengembangan (satu kali) | {total}\nLayanan bulanan pascapeluncuran | Rp 0 / bulan\nLayanan tahunan pascapeluncuran | Rp 0 / tahun",
        { label: "62, 38" },
      ),
      b(
        "note",
        "Catatan: Rincian lengkap masing-masing komponen dijabarkan pada bagian Rencana Anggaran Biaya dan Layanan Pemeliharaan.",
      ),
    ]),
    s("Latar Belakang", [
      b(
        "paragraph",
        "Koordinasi dan pengelolaan informasi di {client} selama ini berlangsung secara manual dan tersebar di berbagai kanal. Pola ini mulai menunjukkan keterbatasan: data tidak terpusat, dokumentasi sulit ditelusuri, dan citra kelembagaan belum sepenuhnya tercermin.\n\nSebagai tindak lanjut, {provider} mengajukan pengembangan {project} untuk menjawab kebutuhan tersebut secara terstruktur.",
      ),
    ]),
    s("Tujuan Proposal", [
      b(
        "numbered",
        "Memformalkan kesepakatan kerja antara penyedia jasa dan {client}.\nMenetapkan Rencana Anggaran Biaya (RAB) yang rinci, transparan, dan dapat dipertanggungjawabkan.\nMenetapkan struktur biaya operasional setelah peluncuran.\nMenjabarkan tanggung jawab, batasan pekerjaan, dan kepemilikan aset digital sejak awal.",
      ),
    ]),
    s("Ruang Lingkup Pekerjaan", [
      b("subheading", "Cakupan Pekerjaan"),
      b(
        "bullets",
        "Komponen A | Deskripsi singkat cakupan komponen A.\nKomponen B | Deskripsi singkat cakupan komponen B.\nKomponen C | Deskripsi singkat cakupan komponen C.",
      ),
      b("subheading", "Di Luar Lingkup"),
      b(
        "bullets",
        "Fitur atau modul di luar daftar cakupan\nAplikasi mobile native\nIntegrasi sistem pembayaran\nPerubahan besar pada desain setelah disetujui",
      ),
      b(
        "note",
        "Catatan: Butir di luar lingkup dapat diusulkan sebagai fase lanjutan setelah sistem utama berjalan stabil.",
      ),
    ]),
    s("Solusi yang Ditawarkan", [
      b(
        "paragraph",
        "Sistem yang ditawarkan menggantikan koordinasi manual dengan platform yang terukur dan dapat diaudit. Seluruh aktivitas penting tercatat dengan penanda waktu, sehingga perkembangan dapat dilaporkan sebagai data yang nyata dan bukan klaim kualitatif.",
      ),
    ]),
    s("Fitur & Deliverables", [
      b(
        "table",
        "Fitur | Deskripsi\nFitur utama 1 | Penjelasan singkat fitur utama 1.\nFitur utama 2 | Penjelasan singkat fitur utama 2.\nFitur utama 3 | Penjelasan singkat fitur utama 3.",
        { label: "30, 70" },
      ),
    ]),
    s("Teknologi & Infrastruktur", [
      b(
        "paragraph",
        "Seluruh komponen memakai teknologi modern dan standar industri, dipilih untuk keandalan, keamanan data, dan kemudahan pemeliharaan jangka panjang.",
      ),
      b(
        "table",
        "Komponen | Teknologi\nFrontend | React + TypeScript\nBasis data & autentikasi | Supabase (PostgreSQL)\nHosting | Vercel\nDomain | Domain kustom",
        { label: "35, 65" },
      ),
    ]),
    s("Metodologi Pelaksanaan", [
      b(
        "numbered",
        "Perencanaan | Analisis kebutuhan, arsitektur informasi, dan spesifikasi teknis.\nPengembangan | Perancangan antarmuka, pengembangan sistem, dan integrasi.\nPengujian & Quality Assurance | Pemeriksaan fungsional menyeluruh sebelum diakses publik.\nPeluncuran | Distribusi akses resmi beserta pendampingan pengguna awal.",
      ),
    ]),
    s("Jadwal Waktu", [
      b(
        "table",
        "Tahap | Estimasi Waktu | Kegiatan\nPersiapan | 1 minggu | Pengumpulan aset, teks resmi, dan data yang dibutuhkan.\nPengembangan | 2 sampai 3 minggu | Pembangunan dan integrasi sistem.\nPengujian & QA | 3 sampai 5 hari | Pengujian fungsional dan perbaikan akhir.\nPeluncuran | 2 sampai 3 hari | Pengujian go-live dan serah terima.",
        { label: "22, 22, 56" },
      ),
      b(
        "note",
        "Catatan: Estimasi total 4 sampai 6 minggu sejak proposal disetujui dan seluruh konten diterima.",
      ),
    ]),
    s("Rencana Anggaran Biaya (RAB) / Investasi Satu Kali", [
      b(
        "paragraph",
        "Investasi satu kali ini mencakup seluruh pekerjaan hingga sistem siap dioperasikan dan diluncurkan.",
      ),
      b("subheading", "Rincian RAB Bagian A: Pengembangan"),
      b(
        "cost",
        "Analisis kebutuhan dan spesifikasi teknis | 1 | Paket | 0\nPerancangan UI/UX | 1 | Paket | 0\nPengembangan frontend | 1 | Paket | 0\nPerancangan dan implementasi basis data | 1 | Paket | 0\nPengujian dan quality assurance | 1 | Paket | 0",
        { label: "Subtotal A: Pengembangan", counted: true },
      ),
      b("subheading", "Rincian RAB Bagian B: Infrastruktur"),
      b(
        "cost",
        "Registrasi domain (tahun ke-1) | 1 | Tahun | 0\nSetup DNS, SSL, dan environment produksi | 1 | Paket | 0",
        { label: "Subtotal B: Infrastruktur", counted: true },
      ),
      b("subheading", "Skema Pembayaran"),
      b(
        "payment",
        "Uang Muka (DP): saat kontrak ditandatangani | 40\nTermin Pengembangan: saat sistem inti siap diuji | 30\nPelunasan: saat peluncuran resmi | 30",
        { label: "Total Investasi Pengembangan" },
      ),
    ]),
    s("Layanan Pemeliharaan & Pengelolaan Bulanan", [
      b(
        "paragraph",
        "Setelah peluncuran, organisasi memerlukan dukungan teknis atas sistem dan dukungan operasional atas konten sehari-hari. Layanan bulanan menggabungkan keduanya dalam satu paket terkelola.",
      ),
      b(
        "table",
        "Komponen Layanan Bulanan | Nilai\nDukungan administrasi dan pengelolaan konten | Rp 0\nLayanan pemeliharaan teknis | Rp 0\nInfrastruktur pihak ketiga (at cost) | Rp 0\nTotal | Rp 0 / bulan",
        { label: "68, 32" },
      ),
      b(
        "note",
        "Catatan: Biaya infrastruktur pihak ketiga diteruskan tanpa markup dan dapat berbeda mengikuti kurs dan tingkat penggunaan.",
      ),
      b("subheading", "Cakupan Layanan Bulanan"),
      b(
        "compare",
        "Perbaikan bug pada fitur yang telah diserahkan\nMonitoring uptime dan performa\nPembaruan keamanan rutin\nHingga 4 jam pekerjaan teknis ringan per bulan",
        {
          label: "Termasuk dalam Layanan Bulanan",
          label2: "Tidak Termasuk (biaya terpisah)",
          body2:
            "Pengembangan fitur baru\nPerubahan besar pada struktur atau desain\nIntegrasi sistem pihak ketiga baru\nPekerjaan di luar 4 jam per bulan",
        },
      ),
    ]),
    s("Service Level & Dukungan", [
      b(
        "bullets",
        "Isu non-kritis | Direspons dalam waktu maksimal 1x24 jam pada hari kerja.\nIsu kritis | Direspons dalam waktu maksimal 6 jam sejak dilaporkan.\nKanal komunikasi | WhatsApp dan/atau surel yang disepakati bersama.",
      ),
    ]),
    s("Tanggung Jawab Para Pihak", [
      b(
        "compare",
        "Menyediakan konten dan data tepat waktu\nMenugaskan satu narahubung\nMelakukan pembayaran sesuai skema yang disepakati",
        {
          label: "Tanggung Jawab Klien",
          label2: "Tanggung Jawab Penyedia Jasa",
          body2:
            "Menyelesaikan pekerjaan sesuai lingkup dan jadwal\nMenjaga keamanan dan ketersediaan sistem\nMemberikan pelatihan penggunaan\nMelaporkan status layanan secara berkala",
        },
      ),
    ]),
    s("Asumsi & Batasan", [
      b(
        "numbered",
        "Jadwal pembayaran mengikuti skema pada bagian Rencana Anggaran Biaya.\nKonten yang dibutuhkan disediakan oleh klien sesuai jadwal.\nEstimasi biaya pihak ketiga mengacu pada harga saat proposal disusun ({date}).\nPenghentian pekerjaan di tengah jalan diselesaikan berdasarkan proporsi pekerjaan yang telah diserahkan.",
      ),
    ]),
    s("Ketentuan Pembayaran", [
      b(
        "paragraph",
        "Skema pembayaran investasi pengembangan mengikuti bagian Skema Pembayaran. Layanan bulanan ditagihkan pada awal setiap periode, dengan bukti pembayaran berupa kuitansi yang ditandatangani kedua pihak.",
      ),
    ]),
    s("Garansi & Dukungan Pasca-Peluncuran", [
      b(
        "paragraph",
        "Penyedia jasa memberikan garansi perbaikan bug selama 30 (tiga puluh) hari kalender sejak peluncuran resmi, tanpa biaya tambahan, khusus untuk cacat pada fitur yang telah diserahkan sesuai lingkup.",
      ),
      b(
        "compare",
        "Bug atau kesalahan fungsi pada fitur yang diserahkan\nKetidaksesuaian hasil dengan lingkup yang disepakati",
        {
          label: "Termasuk dalam Garansi",
          label2: "Tidak Termasuk dalam Garansi",
          body2:
            "Permintaan fitur baru\nPerubahan konten\nKegagalan layanan pihak ketiga",
        },
      ),
    ]),
    s("Kebijakan Permintaan Perubahan (Change Request)", [
      b(
        "paragraph",
        "Permintaan di luar cakupan layanan bulanan akan diberikan penawaran biaya terpisah sebelum dikerjakan, dengan tarif indikatif Rp 0 per jam atau kuotasi tetap per tugas untuk pekerjaan berskala lebih besar.",
      ),
    ]),
    s("Kepemilikan & Hak Kekayaan Intelektual", [
      b(
        "numbered",
        "Source Code | Menjadi milik klien sepenuhnya setelah pelunasan investasi pengembangan.\nDomain | Didaftarkan atas nama klien sebagai pemilik terdaftar.\nBasis Data | Seluruh data adalah milik klien, ekspor data dapat diberikan kapan pun diminta.\nKonten | Seluruh konten yang diunggah tetap menjadi hak dan milik klien.",
      ),
    ]),
    s("Syarat & Ketentuan Umum", [
      b(
        "numbered",
        "Masa Berlaku | Kerja sama berlaku sejak proposal disetujui dan dapat diakhiri oleh salah satu pihak dengan pemberitahuan tertulis 30 hari sebelumnya.\nKerahasiaan | Data internal yang diakses selama pekerjaan tidak dibagikan kepada pihak ketiga tanpa izin.\nForce Majeure | Keterlambatan akibat gangguan di luar kendali wajar kedua pihak tidak dianggap wanprestasi.\nPenyelesaian Perselisihan | Perbedaan pendapat diselesaikan melalui musyawarah.",
      ),
    ]),
    s("Penutup", [
      b(
        "paragraph",
        "Proposal ini diajukan untuk memastikan pengembangan, peluncuran, dan pengelolaan {project} berjalan dengan kejelasan biaya, tanggung jawab, dan tata kelola sejak awal. Penyedia jasa menyatakan kesiapan untuk melanjutkan pekerjaan ini secara profesional dan bertanggung jawab penuh atas hasil yang dicapai.",
      ),
    ]),
  ],
});

const SHORT = (): ProposalContent => ({
  coverTitle: "PROPOSAL PENAWARAN\n{project}",
  headerText: "{client} | Proposal {project}",
  providerRole: "Penyedia Jasa Pengembangan & Pengelolaan Sistem",
  showToc: false,
  leftLabel: "Diajukan oleh,",
  rightLabel: "Mengetahui dan menyetujui,",
  sections: [
    s("Ringkasan", [
      b(
        "paragraph",
        "Dokumen ini mengajukan penawaran pekerjaan {project} bagi {client}, mencakup ruang lingkup, jadwal, dan investasi.",
      ),
    ]),
    s("Ruang Lingkup", [
      b(
        "bullets",
        "Komponen A | Deskripsi singkat.\nKomponen B | Deskripsi singkat.",
      ),
    ]),
    s("Jadwal", [
      b(
        "table",
        "Tahap | Estimasi Waktu | Kegiatan\nPengembangan | 4 minggu | Pembangunan sistem.\nPeluncuran | 1 minggu | Pengujian dan serah terima.",
        { label: "24, 24, 52" },
      ),
    ]),
    s("Investasi", [
      b(
        "cost",
        "Pengembangan sistem | 1 | Paket | 0\nInfrastruktur awal | 1 | Paket | 0",
        { label: "Total Investasi", counted: true },
      ),
      b("caption", "Skema Pembayaran"),
      b("payment", "Uang Muka (DP) | 50\nPelunasan | 50", { label: "Total" }),
    ]),
    s("Syarat & Ketentuan", [
      b(
        "numbered",
        "Uang muka dibayar sebelum pekerjaan dimulai.\nPelunasan dibayar saat penyerahan hasil akhir.\nKepemilikan hasil pekerjaan beralih ke klien setelah pembayaran penuh.",
      ),
    ]),
    s("Penutup", [
      b(
        "paragraph",
        "Terima kasih atas kesempatan ini. Tanda tangan di bawah menandakan persetujuan atas lingkup, jadwal, dan biaya di atas.",
      ),
    ]),
  ],
});

const BLANK = (): ProposalContent => ({
  coverTitle: "PROPOSAL\n{project}",
  headerText: "{client} | Proposal",
  providerRole: "Penyedia Jasa",
  showToc: false,
  leftLabel: "Diajukan oleh,",
  rightLabel: "Mengetahui dan menyetujui,",
  sections: [s("Pendahuluan", [b("paragraph")])],
});

const BUILDERS: Record<ProposalTemplateId, () => ProposalContent> = {
  full: FULL,
  short: SHORT,
  blank: BLANK,
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
    showNumber: false,
    clientName: "",
    clientUnit: "",
    coverLogo: "",
    projectName: "",
    approverName: "",
    approverRole: "",
    ...buildTemplate(templateId),
  };
}
