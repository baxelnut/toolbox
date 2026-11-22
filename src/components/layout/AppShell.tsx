import { Outlet, useNavigation } from "react-router";
// Routes
import { ROUTES } from "@/app/routes";
// Style
import "./AppShell.css";
// Components
import { Header, Footer } from ".";
// Data
import { SITE } from "@/data/site";
import { TOOLS } from "@/data/tools";

const NAV_LINKS = [
  { to: ROUTES.home, label: "Home" },
  ...TOOLS.map((tool) => ({ to: tool.path, label: tool.navLabel })),
];

export function AppShell() {
  const navigation = useNavigation();

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {navigation.state !== "idle" && (
        <div className="route-bar" aria-hidden="true" />
      )}
      <Header brand={SITE.name} links={NAV_LINKS} />
      <Outlet />
      <Footer owner={SITE.owner} ownerUrl={SITE.ownerUrl} />
    </div>
  );
}
