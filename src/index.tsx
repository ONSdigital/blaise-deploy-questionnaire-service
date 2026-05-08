import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!("process" in globalThis)) {
  const shimmedProcess = {
    env: {
      NODE_ENV: import.meta.env.MODE,
    },
  };

  Object.defineProperty(globalThis, "process", {
    configurable: true,
    writable: true,
    value: shimmedProcess,
  });
}

const appRootElement = rootElement;

function showBootstrapError(message: string): void {
  appRootElement.innerHTML = `<div style="color: #b00020; background: #fff5f5; border: 1px solid #f5c2c7; padding: 16px; margin: 16px; font-family: sans-serif;"><h1 style="margin-top: 0;">App failed to load</h1><pre style="white-space: pre-wrap; margin-bottom: 0;">${message}</pre></div>`;
}

window.addEventListener("error", (event) => {
  const errorMessage = event.error instanceof Error ? event.error.stack ?? event.error.message : String(event.message);
  console.error("Unhandled error while bootstrapping app:", event.error ?? event.message);
  showBootstrapError(errorMessage);
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? event.reason.stack ?? event.reason.message : String(event.reason);
  console.error("Unhandled promise rejection while bootstrapping app:", event.reason);
  showBootstrapError(reason);
});

console.log("Mounting React app...");

const root = ReactDOM.createRoot(rootElement);

void (async () => {
  try {
    const { default: App } = await import("./app");

    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    );

    console.log("React app mounted successfully");
  } catch (error) {
    console.error("Error mounting React app:", error);
    showBootstrapError(String(error));
  }
})();
