import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { clientLogger } from "./utils/logger";
import { queryClient } from "./utils/queryClient";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const appRootElement = rootElement;

function showBootstrapError(message: string): void {
  appRootElement.innerHTML = `<div style="color: #b00020; background: #fff5f5; border: 1px solid #f5c2c7; padding: 16px; margin: 16px; font-family: sans-serif;"><h1 style="margin-top: 0;">App failed to load</h1><pre style="white-space: pre-wrap; margin-bottom: 0;">${message}</pre></div>`;
}

clientLogger.info("Mounting React app");

const root = ReactDOM.createRoot(rootElement);

void (async () => {
  try {
    const { default: App } = await import("./app");

    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </StrictMode>,
    );

    clientLogger.info("React app mounted successfully");
  } catch (error) {
    clientLogger.error("Error mounting React app", error);
    showBootstrapError(String(error));
  }
})();
