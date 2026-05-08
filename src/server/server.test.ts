/* eslint-disable import-x/order */
/**
 * @vitest-environment node
 */
import { newServer } from "./server";

import supertest from "supertest";

const { mockGetQuestionnaires } = vi.hoisted(() => ({
  mockGetQuestionnaires: vi.fn(),
}));

vi.mock("blaise-api-node-client", () => ({
  BlaiseApiClient: class MockBlaiseApiClient {
    constructor(_url?: string) {
      // Intentionally empty for tests.
    }

    public getQuestionnaires = mockGetQuestionnaires;
  },
  default: class MockBlaiseApiClient {
    constructor(_url?: string) {
      // Intentionally empty for tests.
    }

    public getQuestionnaires = mockGetQuestionnaires;
  },
}));
vi.mock("blaise-uac-service-node-client", () => ({
  __esModule: true,
  default: class MockBusClient {
    constructor(_url?: string, _clientId?: string) {
      // Intentionally empty for tests.
    }
  },
}));
vi.mock("@google-cloud/logging", () => ({
  Logging: class MockLogging {
    constructor(_options?: unknown) {
      // Intentionally empty for tests.
    }

    public log(_logName: string) {
      return {
        getEntries: async () => [[]],
      };
    }
  },
}));
vi.mock("@google-cloud/storage", () => ({
  Storage: class MockStorage {
    constructor(_options?: unknown) {
      // Intentionally empty for tests.
    }

    public bucket(_bucketName: string) {
      return {
        file: (_fileName: string) => ({
          getSignedUrl: async () => [""],
          getMetadata: async () => [{}],
        }),
        getFiles: async () => [[]],
      };
    }
  },
}));
vi.mock("blaise-login-react-server", async () => {
  const { mockLoginReactServerModule } = await import("../tests/utils/mockLoginReactServer");

  return mockLoginReactServerModule();
});
import { Auth } from "blaise-login-react-server";

import { getConfigFromEnv } from "./config";

Auth.prototype.ValidateToken = vi.fn().mockReturnValue(true);

const config = getConfigFromEnv();
const request = supertest(newServer(config));

describe("Test Health Endpoint", () => {
  it("should return a 200 status and json message", async () => {
    const response = await request.get("/dqs-ui/version/health");

    expect(response.statusCode).toEqual(200);
    expect(response.body).toStrictEqual({ healthy: true });
  });
});

describe("Given the API returns 2 questionnaires", () => {
  beforeEach(() => {
    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.resolve(apQuestionnaireList);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  const apQuestionnaireList = [
    {
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: "OPN2007T",
      serverParkName: "LocalDevelopment",
    },
    {
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: "OPN2004A",
      serverParkName: "LocalDevelopment",
    },
  ];

  const apiReturnedQuestionnaireList = [
    {
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: "OPN2007T",
      serverParkName: "LocalDevelopment",
      fieldPeriod: "July 2020",
    },
    {
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: "OPN2004A",
      serverParkName: "LocalDevelopment",
      fieldPeriod: "April 2020",
    },
  ];

  it("should return a 200 status and a list with the two", async () => {
    const response = await request.get("/api/questionnaires");

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toStrictEqual(apiReturnedQuestionnaireList);
  });
});

describe("Get list of questionnaires endpoint fails", () => {
  beforeEach(() => {
    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.reject("Network error");
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 500 status and an error message", async () => {
    const response = await request.get("/api/questionnaires");

    expect(response.statusCode).toEqual(500);
  });
});
