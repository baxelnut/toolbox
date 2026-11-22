// Style
import "./NotFoundPage.css";
// Routes
import { ROUTES } from "@/app/routes";
// Hooks
import { useDocumentTitle } from "@/hooks";
// Components
import { Button } from "@/components";

export default function NotFoundPage() {
  useDocumentTitle("Not found");

  return (
    <main id="main" tabIndex={-1} className="page">
      <div className="container section">
        <p className="eyebrow">404</p>
        <h1>Nothing here.</h1>
        <p>This page does not exist.</p>
        <Button to={ROUTES.home} iconEnd="arrowRight">
          Back to tools
        </Button>
      </div>
    </main>
  );
}
