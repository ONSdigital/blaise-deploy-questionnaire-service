import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getConfigFromEnv } from "./config";

describe("Config setup", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      BLAISE_API_URL: "mock-api",
      PROJECT_ID: "a-project-name",
      BUCKET_NAME: "unique-bucket",
      SERVER_PARK: "gusty",
      BIMS_API_URL: "bims-mock-api",
      BIMS_CLIENT_ID: "mock-client-id",
      BUS_API_URL: "bus-mock-api",
      BUS_CLIENT_ID: "bus-client-id",
      CREATE_DONOR_CASES_CLOUD_FUNCTION_URL: "https://mock/create",
      REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL: "https://mock/reissue",
      GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL: "https://mock/users-by-role",
      SESSION_TIMEOUT: "12h",
      SESSION_SECRET: "mock-session-secret",
      ROLES: "DST,BDSS",
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
    expect(config.BucketName).toBe("unique-bucket");
    expect(config.BimsApiUrl).toBe("bims-mock-api");
    expect(config.BimsClientId).toBe("mock-client-id");
    expect(config.BusApiUrl).toBe("bus-mock-api");
    expect(config.Port).toBe(5000);
  });

  it("should keep protocol when BLAISE_API_URL already includes http(s)", () => {
    process.env.BLAISE_API_URL = "https://already-qualified-url";

    const config = getConfigFromEnv();

    expect(config.BlaiseApiUrl).toBe("https://already-qualified-url");
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

  it("should continue to provide defaults for optional roles and session timeout", () => {
    process.env.ROLES = undefined;
    process.env.SESSION_TIMEOUT = undefined;

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
