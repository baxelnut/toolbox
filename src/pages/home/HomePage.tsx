// Style
import "./HomePage.css";
// Hooks
import { useDocumentTitle } from "@/hooks";
// Components
import { Button, Card } from "@/components";
// Data
import { TOOLS } from "@/data/tools";

export default function HomePage() {
  useDocumentTitle();

  return (
    <main id="main" tabIndex={-1} className="page">
      <div className="container section" style={{ height: "100%" }}>
        <p className="eyebrow">Toolbox</p>
        <h1 className="statement">Small tools. No signup.</h1>
        <p className="lede">
          Everything runs in your browser. Nothing is uploaded, nothing is
          stored on a server.
        </p>
        <div className="grid-auto scroll-area">
          {TOOLS.map((tool) => (
            <Card key={tool.id} as="article">
              <div className="stack col gap-3">
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <Button to={tool.path} variant="outline" iconEnd="arrowRight">
                  Open
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
