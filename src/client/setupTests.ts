import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";
import axios, { type AxiosAdapter, AxiosHeaders } from "axios";

const globalWithActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

globalWithActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

document.head.innerHTML +=
  '<script id="app-config" type="application/json">{"projectId":"test-project","urlDomain":"surveys.test"}</script>';

// Feature tests perform full page flows and can exceed the default 1s async timeout.
configure({ asyncUtilTimeout: 5000 });

const testAdapter: AxiosAdapter = async (config) => {
  const method = (config.method ?? "GET").toUpperCase();
  const url = config.url ?? "<unknown-url>";

  // Allow client logger calls without mocking
  if (method === "POST" && url === "/api/client-log") {
    return {
      data: {},
      status: 200,
      statusText: "OK",
      headers: new AxiosHeaders(),
      config,
    };
  }

  const message = `Unmocked HTTP request in tests: ${method} ${url}. Add a test mock for this request.`;

  console.error(message);
  throw new Error(message);
};

axios.defaults.adapter = testAdapter;
