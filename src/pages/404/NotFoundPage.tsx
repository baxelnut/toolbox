import { Link, useLocation } from "react-router";
// Routes
import { ROUTES } from "@/app/routes";
// Style
import "./NotFoundPage.css";
// Hooks
import { useDocumentTitle } from "@/hooks";
// Components
import { Button } from "@/components";
// Utils
import { TOOLS } from "@/data/tools";

export default function NotFoundPage() {
  useDocumentTitle("Not found");
  const { pathname } = useLocation();

  return (
    <main id="main" tabIndex={-1} className="page">
      <div className="container not-found">
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <h1>Nothing here.</h1>
        <p>
          No page lives at <code className="not-found__path">{pathname}</code>.
        </p>

        <Button to={ROUTES.home} iconEnd="arrowRight">
          Back to tools
        </Button>

        <nav className="not-found__links" aria-label="Tools">
          {TOOLS.map((tool) => (
            <Link key={tool.id} to={tool.path} className="not-found__link">
              {tool.title}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
