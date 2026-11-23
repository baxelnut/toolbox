import { useEffect, useMemo, useState } from "react";
// Style
import "./InvoicePage.css";
// Hooks
import { useInvoice } from "@/hooks";
// Components
import { Button, ToolPage, SheetPreview } from "@/components";
import { ClientSection, DocumentSection, InvoiceSheet } from "./_components";
import { ItemsSection, PrintRoot, ProfileSection } from "./_components";
import { TextSection, TotalsSection } from "./_components";
// Utils
import { buildDocument, safeFilename } from "@/lib/invoice";

export default function InvoicePage() {
  const invoice = useInvoice();
  const [printing, setPrinting] = useState(false);

  const doc = useMemo(
    () => buildDocument(invoice.draft, invoice.profile),
    [invoice.draft, invoice.profile],
  );

  const fileTitle = safeFilename(
    [doc.number, doc.client.name].filter(Boolean).join(" - "),
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.pageScroll = "";
    return () => {
      delete root.dataset.pageScroll;
    };
  }, []);

  return (
    <ToolPage toolId="invoice">
      <div className="invoice">
        <div className="invoice__form">
          <DocumentSection invoice={invoice} />
          <ClientSection invoice={invoice} />
          <ItemsSection invoice={invoice} />
          <TotalsSection invoice={invoice} />
          <TextSection invoice={invoice} />
          <ProfileSection invoice={invoice} />
        </div>

        <div className="invoice__preview">
          <div className="invoice__bar">
            <Button
              icon="download"
              disabled={printing}
              onClick={() => setPrinting(true)}
            >
              Download PDF
            </Button>
            {/* <small>Pick "Save as PDF" and paper A4 in the print dialog.</small> */}
          </div>

          {invoice.issues.length > 0 && (
            <ul className="invoice__issues">
              {invoice.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}

          <SheetPreview>
            <InvoiceSheet doc={doc} />
          </SheetPreview>
        </div>
      </div>

      {printing && (
        <PrintRoot
          title={fileTitle}
          onDone={() => {
            setPrinting(false);
            invoice.markPrinted();
          }}
        >
          <InvoiceSheet doc={doc} />
        </PrintRoot>
      )}
    </ToolPage>
  );
}
