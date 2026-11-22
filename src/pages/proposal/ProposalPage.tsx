import { useMemo, useState } from "react";
// Style
import "./ProposalPage.css";
// Hooks
import { useProposal } from "@/hooks";
// Components
import { Button, PrintRoot, SheetPreview, ToolPage } from "@/components";
import { ClientSection, ContentSection, DocumentSection } from "./_components";
import { PricingSection, ProfileSection } from "./_components";
import { ProposalSheet, TimelineSection } from "./_components";
// Utils
import { safeFilename } from "@/lib/invoice";
import { buildProposalDocument } from "@/lib/proposal";

const PAGE_CSS = "@page { size: A4; margin: 15mm 15mm 18mm; }";

export default function ProposalPage() {
  const proposal = useProposal();
  const [printing, setPrinting] = useState(false);

  const doc = useMemo(
    () =>
      buildProposalDocument(
        proposal.draft,
        proposal.profile,
        proposal.settings,
      ),
    [proposal.draft, proposal.profile, proposal.settings],
  );

  const fileTitle = safeFilename(
    [doc.number, doc.client.name].filter(Boolean).join(" - "),
  );

  return (
    <ToolPage toolId="proposal">
      <div className="proposal">
        <div className="proposal__form">
          <DocumentSection proposal={proposal} />
          <ClientSection proposal={proposal} />
          <ContentSection proposal={proposal} />
          <TimelineSection proposal={proposal} />
          <PricingSection proposal={proposal} />
          <ProfileSection proposal={proposal} />
        </div>

        <div className="proposal__preview">
          <div className="proposal__bar">
            <Button
              icon="download"
              disabled={printing}
              onClick={() => setPrinting(true)}
            >
              Download PDF
            </Button>
            <small>
              In the print dialog pick "Save as PDF", paper A4, and untick
              "Headers and footers".
            </small>
          </div>

          {proposal.issues.length > 0 && (
            <ul className="proposal__issues">
              {proposal.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}

          <SheetPreview multiPage pageContentHeight={998} chromeHeight={125}>
            <ProposalSheet doc={doc} />
          </SheetPreview>
        </div>
      </div>

      {printing && (
        <PrintRoot
          title={fileTitle}
          pageCss={PAGE_CSS}
          onDone={() => {
            setPrinting(false);
            proposal.markPrinted();
          }}
        >
          <ProposalSheet doc={doc} />
        </PrintRoot>
      )}
    </ToolPage>
  );
}
