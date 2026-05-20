const { authHeader, authManagerOptions, clearToken, getToken } = vi.hoisted(() => ({
  authHeader: vi.fn(),
  authManagerOptions: vi.fn(),
  clearToken: vi.fn(),
  getToken: vi.fn(),
}));

vi.mock("blaise-login-react-client", () => ({
  AuthManager: class MockAuthManager {
    constructor(options: unknown) {
      authManagerOptions(options);
    }

    authHeader = authHeader;
    clearToken = clearToken;
    getToken = getToken;
  },
  createSessionKey: (environmentKey: string) => `blaise-user-${environmentKey}`,
}));

describe("axiosConfig", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports whether an auth token exists", async () => {
    vi.resetModules();
    getToken.mockReturnValue("test-token");
    const { hasAuthToken } = await import("./axiosConfig");

    expect(hasAuthToken()).toBe(true);

    vi.resetModules();
    getToken.mockReturnValue(null);
    const { hasAuthToken: hasNoAuthToken } = await import("./axiosConfig");

    expect(hasNoAuthToken()).toBe(false);
  });

  it("returns JSON headers merged with auth headers", async () => {
    vi.resetModules();
    authHeader.mockReturnValue({ Authorization: "Bearer test-token" });
    const { default: axiosConfig } = await import("./axiosConfig");

    expect(axiosConfig()).toEqual({
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
    });
    expect(authManagerOptions).toHaveBeenCalledWith({
      sessionKey: "blaise-user-test-project",
      cookieDomain: "surveys.test",
    });
    expect(authHeader).toHaveBeenCalled();
  });

  it("returns only the content type header when auth headers are empty", async () => {
    vi.resetModules();
    authHeader.mockReturnValue({});
    const { default: axiosConfig } = await import("./axiosConfig");

    expect(axiosConfig()).toEqual({
      headers: {
        "Content-Type": "application/json",
      },
    });
  });
});
