import { waitFor } from "@testing-library/react";
import React from "react";

const mocks = vi.hoisted(() => {
  const render = vi.fn();
  const createRoot = vi.fn(() => ({ render }));
  const info = vi.fn();
  const error = vi.fn();

  return { createRoot, error, info, render };
});

vi.mock("react-dom/client", () => ({
  createRoot: mocks.createRoot,
  default: {
    createRoot: mocks.createRoot,
  },
}));

vi.mock("@tanstack/react-query", () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("./utils/queryClient", () => ({
  queryClient: {},
}));

vi.mock("./utils/logger", () => ({
  clientLogger: {
    error: mocks.error,
    info: mocks.info,
  },
}));

describe("client bootstrap", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mocks.createRoot.mockClear();
    mocks.render.mockClear();
    mocks.info.mockClear();
    mocks.error.mockClear();
    mocks.createRoot.mockReturnValue({ render: mocks.render });
    vi.resetModules();
    vi.doUnmock("./app");
  });

  it("mounts the app successfully", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    vi.doMock("./app", () => ({
      default: () => <div>Loaded app</div>,
    }));

    await import("./index");

    await waitFor(() => {
      expect(mocks.render).toHaveBeenCalledTimes(1);
    });

    expect(mocks.createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(mocks.info).toHaveBeenCalledWith("Mounting React app");
    expect(mocks.info).toHaveBeenCalledWith("React app mounted successfully");
  }, 15000);

  it("throws when the root element is missing", async () => {
    await expect(import("./index")).rejects.toThrow("Root element not found");
    expect(mocks.createRoot).not.toHaveBeenCalled();
  }, 15000);

  it("shows a bootstrap error when loading the app fails", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    vi.doMock("./app", () => {
      throw new Error("boom");
    });

    const rootElement = document.getElementById("root");

    await import("./index");

    await waitFor(() => {
      expect(mocks.error).toHaveBeenCalledWith("Error mounting React app", expect.any(Error));
    });

    expect(rootElement?.textContent).toContain("App failed to load");
  }, 15000);
});
