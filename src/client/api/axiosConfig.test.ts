const { authHeader } = vi.hoisted(() => ({
  authHeader: vi.fn(),
}));

vi.mock("blaise-login-react-client", () => ({
  AuthManager: class MockAuthManager {
    authHeader = authHeader;
  },
}));

import axiosConfig from "./axiosConfig";

describe("axiosConfig", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns JSON headers merged with auth headers", () => {
    authHeader.mockReturnValue({ Authorization: "Bearer test-token" });

    expect(axiosConfig()).toEqual({
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
    });
    expect(authHeader).toHaveBeenCalled();
  });

  it("returns only the content type header when auth headers are empty", () => {
    authHeader.mockReturnValue({});

    expect(axiosConfig()).toEqual({
      headers: {
        "Content-Type": "application/json",
      },
    });
  });
});