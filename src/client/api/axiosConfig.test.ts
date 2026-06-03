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

  it("clears the token and dispatches an auth-expired event when a 401 response is received and a token exists", async () => {
    vi.resetModules();
    getToken.mockReturnValue("test-token");
    await import("./axiosConfig");

    const { default: axios } = await import("axios");
    const { default: MockAdapter } = await import("axios-mock-adapter");
    const mock = new MockAdapter(axios);
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    mock.onGet("/test").reply(401);

    await expect(axios.get("/test")).rejects.toBeDefined();

    expect(clearToken).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "dqs-auth-expired" }));

    mock.restore();
  });

  it("rethrows without dispatching when the error is not an object", async () => {
    vi.resetModules();
    getToken.mockReturnValue("test-token");
    await import("./axiosConfig");

    const { default: axios } = await import("axios");
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    // If a request interceptor throws a non-object (e.g. a string), Axios passes it
    // through the response error interceptors unchanged.
    const reqId = axios.interceptors.request.use(() => {
      throw "non-object-error";
    });

    await expect(axios.get("/test")).rejects.toBe("non-object-error");

    expect(clearToken).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();

    axios.interceptors.request.eject(reqId);
  });
});
