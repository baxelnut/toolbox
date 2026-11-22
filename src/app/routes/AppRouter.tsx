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
      { index: true, lazy: page(() => import("@/pages/Home")) },
      { path: ROUTES.qr, lazy: page(() => import("@/pages/Qr")) },
      { path: ROUTES.invoice, lazy: page(() => import("@/pages/Invoice")) },
      { path: ROUTES.proposal, lazy: page(() => import("@/pages/Proposal")) },
      {
        path: ROUTES.background,
        lazy: page(() => import("@/pages/Background")),
      },
      { path: "*", lazy: page(() => import("@/pages/NotFound")) },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
