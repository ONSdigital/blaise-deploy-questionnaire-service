import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getConfigFromEnv } from "./config.js";

describe("Config setup", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      BLAISE_API_URL: "mock-api",
      PROJECT_ID: "a-project-name",
      URL_DOMAIN: "surveys.gcp.onsdigital.uk",
      BUCKET_NAME: "unique-bucket",
      SERVER_PARK: "gusty",
      BIMS_API_URL: "bims-mock-api",
      BIMS_CLIENT_ID: "mock-client-id",
      BUS_API_URL: "bus-mock-api",
      BUS_CLIENT_ID: "bus-client-id",
      CREATE_DONOR_CASES_CLOUD_FUNCTION_URL: "https://mock/create",
      REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL: "https://mock/reissue",
      GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL: "https://mock/users-by-role",
      SESSION_SECRET: "mock-session-secret",
      PORT: "5000",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return the correct environment variables", () => {
    const config = getConfigFromEnv();

    expect(config.BlaiseApiUrl).toBe("http://mock-api");
    expect(config.ProjectId).toBe("a-project-name");
    expect(config.UrlDomain).toBe("surveys.gcp.onsdigital.uk");
    expect(config.BucketName).toBe("unique-bucket");
    expect(config.BimsApiUrl).toBe("bims-mock-api");
    expect(config.BimsClientId).toBe("mock-client-id");
    expect(config.BusApiUrl).toBe("bus-mock-api");
    expect(config.Port).toBe(5000);
    expect(config.SessionSecret).toBe("mock-session-secret");
    expect(config.TokenIssuer).toBe("a-project-name");
  });

  it("should keep protocol when BLAISE_API_URL already includes http(s)", () => {
    process.env.BLAISE_API_URL = "https://already-qualified-url";

    const config = getConfigFromEnv();

    expect(config.BlaiseApiUrl).toBe("https://already-qualified-url");
  });

  it("should use http for localhost BLAISE_API_URL", () => {
    process.env.BLAISE_API_URL = "localhost:8080";

    const config = getConfigFromEnv();

    expect(config.BlaiseApiUrl).toBe("http://localhost:8080");
  });

  it("should use http for 127.0.0.1 BLAISE_API_URL", () => {
    process.env.BLAISE_API_URL = "127.0.0.1:8080";

    const config = getConfigFromEnv();

    expect(config.BlaiseApiUrl).toBe("http://127.0.0.1:8080");
  });

  it("should throw an error if required variables are not defined", () => {
    process.env.BLAISE_API_URL = undefined;
    process.env.PROJECT_ID = undefined;
    process.env.BUCKET_NAME = undefined;

    expect(() => getConfigFromEnv()).toThrow(
      "Missing required environment variables: BLAISE_API_URL, PROJECT_ID, BUCKET_NAME",
    );
  });

  it("should throw for invalid PORT values", () => {
    process.env.PORT = "invalid-port";

    expect(() => getConfigFromEnv()).toThrow("Invalid PORT value: invalid-port");
  });

  it("should default PORT to 5000 when it is not defined", () => {
    process.env.PORT = undefined;

    const config = getConfigFromEnv();

    expect(config.Port).toBe(5000);
  });

  it("should hardcode roles and session timeout regardless of environment overrides", () => {
    process.env.ROLES = "unexpected-role";
    process.env.SESSION_TIMEOUT = "24h";

    const config = getConfigFromEnv();

    expect(config.SessionTimeout).toBe("12h");
    expect(config.Roles).toStrictEqual([
      "DST",
      "BDSS",
      "Researcher",
      "IPS Researcher",
      "IPS Support",
    ]);
  });
});
