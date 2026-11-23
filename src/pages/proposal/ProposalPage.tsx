import { useDeferredValue, useEffect, useMemo, useState } from "react";
// Style
import "./ProposalPage.css";
// Contexts & Hooks
import { useToast } from "@/contexts";
import { useProposal, useProposalLayout } from "@/hooks";
// Components
import { Button, PrintRoot, SheetPreview, ToolPage } from "@/components";
import { ClientSection, ContentSection, DocumentSection } from "./_components";
import { ProfileSection, ProposalMeasure, ProposalPaper } from "./_components";
// Utils
import { safeFilename, downloadBlob } from "@/lib";
import { buildProposalDocument } from "@/lib/proposal";

export default function ProposalPage() {
  const proposal = useProposal();
  const { toast } = useToast();
  const [printing, setPrinting] = useState(false);
  const [wording, setWording] = useState(false);

  const built = useMemo(
    () =>
      buildProposalDocument(
        proposal.draft,
        proposal.profile,
        proposal.settings,
      ),
    [proposal.draft, proposal.profile, proposal.settings],
  );
  const doc = useDeferredValue(built);
  const { atoms, setMeasured, layout } = useProposalLayout(doc);

  const fileTitle = safeFilename(
    [built.number, built.cover.client].filter(Boolean).join(" - "),
  );

  const downloadWord = async () => {
    setWording(true);
    try {
      const { buildProposalDocx } = await import("@/lib/word/proposal");
      downloadBlob(await buildProposalDocx(built), `${fileTitle}.docx`);
      proposal.markPrinted();
      toast("Downloaded");
    } catch {
      toast("Could not create the Word file");
    } finally {
      setWording(false);
    }
  };

  const busy = printing || wording || layout === null;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.pageScroll = "";

    return () => {
      delete root.dataset.pageScroll;
    };
  }, []);

  return (
    <ToolPage toolId="proposal">
      <div className="proposal">
        <div className="proposal__form">
          <DocumentSection proposal={proposal} />
          <ClientSection proposal={proposal} />
          <ContentSection proposal={proposal} />
          <ProfileSection proposal={proposal} />
        </div>

        <div className="proposal__preview">
          <div className="proposal__bar">
            <Button
              icon="download"
              disabled={busy}
              onClick={() => setPrinting(true)}
            >
              Download PDF
            </Button>
            <Button
              variant="outline"
              icon="download"
              disabled={busy}
              onClick={() => void downloadWord()}
            >
              Download Word
            </Button>
            <small>
              {layout ? `${layout.totalPages} pages. ` : ""}
              PDF: pick "Save as PDF" and paper A4. Word: the contents page
              updates when you open the file.
            </small>
          </div>

          {(built.issues.length > 0 || layout?.oversize) && (
            <ul className="proposal__issues">
              {built.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
              {layout?.oversize && (
                <li>
                  One block is taller than a page. Split it into smaller blocks.
                </li>
              )}
            </ul>
          )}

          <SheetPreview>
            {layout ? <ProposalPaper doc={doc} layout={layout} /> : null}
          </SheetPreview>
        </div>
      </div>

      <ProposalMeasure atoms={atoms} onMeasured={setMeasured} />

      {printing && layout && (
        <PrintRoot
          title={fileTitle}
          onDone={() => {
            setPrinting(false);
            proposal.markPrinted();
          }}
        >
          <ProposalPaper doc={doc} layout={layout} />
        </PrintRoot>
      )}
    </ToolPage>
  );
}
