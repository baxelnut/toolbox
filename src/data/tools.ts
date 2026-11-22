import { ROUTES, type RoutePath } from "@/app/routes";

export type ToolId = "qr" | "invoice" | "proposal" | "background";

export type Tool = {
  id: ToolId;
  path: RoutePath;
  title: string;
  navLabel: string;
  description: string;
};

export const TOOLS: readonly Tool[] = [
  {
    id: "qr",
    path: ROUTES.qr,
    title: "QR Code",
    navLabel: "QR",
    description: "Links, text, WiFi, WhatsApp. PNG or SVG out.",
  },
  {
    id: "invoice",
    path: ROUTES.invoice,
    title: "Invoice",
    navLabel: "Invoice",
    description: "Fill the form. Download the PDF.",
  },
  {
    id: "proposal",
    path: ROUTES.proposal,
    title: "Proposal",
    navLabel: "Proposal",
    description: "Scope, timeline, price. One PDF.",
  },
  {
    id: "background",
    path: ROUTES.background,
    title: "BG Remover",
    navLabel: "BG Remover",
    description: "Cut out backgrounds. Runs on your device.",
  },
];

export function getTool(id: ToolId): Tool {
  const tool = TOOLS.find((item) => item.id === id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}
