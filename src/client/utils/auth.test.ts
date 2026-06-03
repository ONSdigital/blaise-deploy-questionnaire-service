const { createSessionKey } = vi.hoisted(() => ({
  createSessionKey: vi.fn((environmentKey: string) => `blaise-user-${environmentKey}`),
}));

vi.mock("blaise-login-react-client", () => ({
  createSessionKey,
}));

function setAppConfigScript(content: string): void {
  const existingElement = document.getElementById("app-config");

  existingElement?.remove();

  const scriptElement = document.createElement("script");

  scriptElement.id = "app-config";
  scriptElement.type = "application/json";
  scriptElement.textContent = content;
  document.head.append(scriptElement);
}

describe("runtime auth config", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    setAppConfigScript('{"projectId":"test-project","urlDomain":"surveys.test"}');
  });

  afterEach(() => {
    document.getElementById("app-config")?.remove();
  });

  it("parses injected runtime config and caches it", async () => {
    const { getRuntimeAppConfig } = await import("./auth.js");

    const firstConfig = getRuntimeAppConfig();

    setAppConfigScript('{"projectId":"other-project","urlDomain":"other.test"}');
    const secondConfig = getRuntimeAppConfig();

    expect(firstConfig).toEqual({
      projectId: "test-project",
      urlDomain: "surveys.test",
    });
    expect(secondConfig).toBe(firstConfig);
  });

  it("creates shared auth options from the runtime config", async () => {
    const { getSharedAuthOptions } = await import("./auth.js");

    expect(getSharedAuthOptions()).toEqual({
      sessionKey: "blaise-user-test-project",
      cookieDomain: "surveys.test",
    });
    expect(createSessionKey).toHaveBeenCalledWith("test-project");
  });

  it("falls back to vite env values when the html contains an unresolved template", async () => {
    setAppConfigScript("<%- appConfigJson %>");
    vi.stubEnv("VITE_PROJECT_ID", "vite-project");
    vi.stubEnv("VITE_URL_DOMAIN", "vite.test");

    const { getRuntimeAppConfig } = await import("./auth.js");

    expect(getRuntimeAppConfig()).toEqual({
      projectId: "vite-project",
      urlDomain: "vite.test",
    });
  });

  it("throws when the injected runtime config contains invalid json", async () => {
    setAppConfigScript('{"projectId":');

    const { getRuntimeAppConfig } = await import("./auth.js");

    expect(() => getRuntimeAppConfig()).toThrow("Failed to parse runtime app config JSON.");
  });

  it("throws when required runtime config is missing", async () => {
    setAppConfigScript("{}");

    const { getRuntimeAppConfig } = await import("./auth.js");

    expect(() => getRuntimeAppConfig()).toThrow(
      "Missing runtime config for projectId. Provide app-config projectId or VITE_PROJECT_ID.",
    );
  });
});
