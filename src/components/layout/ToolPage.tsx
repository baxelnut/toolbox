import type { ReactNode } from "react";
// Hooks
import { useDocumentTitle } from "@/hooks";
// Data
import { getTool, type ToolId } from "@/data/tools";

type ToolPageProps = {
  toolId: ToolId;
  children: ReactNode;
};

export function ToolPage({ toolId, children }: ToolPageProps) {
  const tool = getTool(toolId);
  useDocumentTitle(tool.title);

  return (
    <main id="main" tabIndex={-1} className="page">
      <div className="container page-grid">
        <h1 className="page-title">{tool.title}</h1>
        <div className="section">
          <p className="lede">{tool.description}</p>
          <div className="scroll-area">{children}</div>
        </div>
      </div>
    </main>
  );
}
