import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Styles
import "@/styles/index.css";
// App
import App from "@/app/App";
import { ToastProvider } from "@/components";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
