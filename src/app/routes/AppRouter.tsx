import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
// App
import { AppShell, ProgressBar } from "@/components";
import { ROUTES } from "./AppRoutes";

type PageModule = { default: ComponentType };

const page = (load: () => Promise<PageModule>) => async () => ({
  Component: (await load()).default,
});

function HydrateFallback() {
  return (
    <main className="page">
      <div className="container">
        <ProgressBar label="Loading" />
      </div>
    </main>
  );
}

const router = createBrowserRouter([
  {
    path: ROUTES.home,
    Component: AppShell,
    HydrateFallback,
    children: [
      { index: true, lazy: page(() => import("@/pages/home/HomePage")) },
      { path: ROUTES.qr, lazy: page(() => import("@/pages/qr/QRPage")) },
      {
        path: ROUTES.invoice,
        lazy: page(() => import("@/pages/invoice/InvoicePage")),
      },
      {
        path: ROUTES.proposal,
        lazy: page(() => import("@/pages/proposal/ProposalPage")),
      },
      {
        path: ROUTES.background,
        lazy: page(() => import("@/pages/bg-remover/BGRemoverPage")),
      },
      { path: "*", lazy: page(() => import("@/pages/404/NotFoundPage")) },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
