import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { mockGetQuestionnaires } = vi.hoisted(() => ({
  mockGetQuestionnaires: vi.fn(),
}));

vi.mock("blaise-api-node-client", () => ({
  BlaiseApiClient: class MockBlaiseApiClient {
    constructor(_url?: string) {}

    public getQuestionnaires = mockGetQuestionnaires;
  },
  default: class MockBlaiseApiClient {
    constructor(_url?: string) {}

    public getQuestionnaires = mockGetQuestionnaires;
  },
}));
vi.mock("blaise-uac-service-node-client", () => ({
  __esModule: true,
  BusClient: class MockBusClient {
    constructor(_url?: string, _clientId?: string) {}
  },
  default: class MockBusClient {
    constructor(_url?: string, _clientId?: string) {}
  },
}));
vi.mock("@google-cloud/logging", () => ({
  Logging: class MockLogging {
    constructor(_options?: unknown) {}

    public log(_logName: string) {
      return {
        getEntries: async () => [[]],
      };
    }
  },
}));
vi.mock("@google-cloud/storage", () => ({
  Storage: class MockStorage {
    constructor(_options?: unknown) {}

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
  const { mockLoginReactServerModule } = await import("./test-utils/loginReactServer.mock.js");

  return mockLoginReactServerModule();
});
vi.mock("./helpers/cloudFunctionCallerHelper", () => ({
  callCloudFunction: vi.fn(),
}));
import { Auth } from "blaise-login-react-server";
import supertest from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getConfigFromEnv } from "./config.js";
import { callCloudFunction } from "./helpers/cloudFunctionCallerHelper.js";
import {
  keyGeneratorFromAuthenticatedUser,
  keyGeneratorFromForwardedHeader,
  newServer,
} from "./server.js";

Auth.prototype.validateToken = vi.fn().mockReturnValue(true);

const config = getConfigFromEnv();
const request = supertest(newServer(config));
const mockedCallCloudFunction = vi.mocked(callCloudFunction);

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

describe("Unknown API endpoint", () => {
  it("should return a 404 status and not-found message", async () => {
    const response = await request.get("/api/does-not-exist");

    expect(response.statusCode).toEqual(404);
    expect(response.body).toStrictEqual({ message: "Not found" });
  });
});

describe("Cloud function routes build audit messages", () => {
  beforeEach(() => {
    mockedCallCloudFunction.mockResolvedValue({ message: "Success", status: 200 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("covers createDonorCases when questionnaire_name and role are strings", async () => {
    const response = await request.post("/api/cloudFunction/createDonorCases").send({
      questionnaire_name: "OPN2004A",
      role: "interviewer",
    });

    expect(response.statusCode).toEqual(200);
  });

  it("covers createDonorCases unknown fallbacks when payload is missing", async () => {
    const response = await request.post("/api/cloudFunction/createDonorCases").send({});

    expect(response.statusCode).toEqual(200);
  });

  it("covers reissueNewDonorCase user branch", async () => {
    const response = await request.post("/api/cloudFunction/reissueNewDonorCase").send({
      questionnaire_name: "OPN2004A",
      user: "alex",
    });

    expect(response.statusCode).toEqual(200);
  });

  it("covers reissueNewDonorCase unknown fallbacks", async () => {
    const response = await request.post("/api/cloudFunction/reissueNewDonorCase").send({});

    expect(response.statusCode).toEqual(200);
  });
});

describe("Client route rendering and global error handler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to the built client folder when cwd is not the repo root", () => {
    const serverDir = path.dirname(fileURLToPath(import.meta.url));
    const expectedBuildRoot = path.resolve(serverDir, "../../build");
    const expectedClientBuildFolder = path.resolve(expectedBuildRoot, "client");
    const expectedErrorPage = path.resolve(serverDir, "views/500.html");

    vi.spyOn(process, "cwd").mockReturnValue("/definitely/not/the/repo");
    vi.spyOn(fs, "existsSync").mockImplementation((candidate) => {
      const resolvedCandidate = String(candidate);

      return [expectedBuildRoot, expectedClientBuildFolder, expectedErrorPage].includes(
        resolvedCandidate,
      );
    });

    const app = newServer(config);

    expect(app.get("views")).toEqual(expectedClientBuildFolder);
  });

  it("renders runtime config as safely escaped json in the html", async () => {
    const app = newServer({
      ...config,
      urlDomain: 'surveys.test</script><script>alert("xss")</script>',
    });

    app.set("views", path.resolve(process.cwd()));

    const response = await supertest(app).get("/runtime-config-check");

    expect(response.statusCode).toEqual(200);
    expect(response.text).toMatch(/<script\s+id="app-config"\s+type="application\/json"\s*>/);
    expect(response.text).toContain('"projectId":"test-project-id"');
    expect(response.text).toContain(
      '"urlDomain":"surveys.test\\u003c/script>\\u003cscript>alert(\\"xss\\")\\u003c/script>"',
    );
    expect(response.text).not.toContain("window.appConfig");
  });

  it("returns the static 500 page when render fails and error page exists", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue("<html>500</html>");
    const app = newServer(config);

    app.set("views", "/definitely/missing/views");

    const response = await supertest(app).get("/some/client/route");

    expect(response.statusCode).not.toEqual(200);
    expect(response.text).not.toEqual("Sorry, there is a problem with the service.");
  });

  it("returns plain text fallback when render fails and no error page exists", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    const app = newServer(config);

    app.set("views", "/definitely/missing/views");

    const response = await supertest(app).get("/another/client/route");

    expect(response.statusCode).toEqual(500);
    expect(response.text).toEqual("Sorry, there is a problem with the service.");
  });
});

describe("Rate limiter key generator", () => {
  type KeyGeneratorRequest = Parameters<typeof keyGeneratorFromForwardedHeader>[0];

  it("prefers the first Forwarded for value", () => {
    const request = {
      headers: {
        forwarded: 'for="198.51.100.27:5151";proto=https, for="203.0.113.9";proto=http',
      },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromForwardedHeader(request as KeyGeneratorRequest)).toBe("198.51.100.27");
  });

  it("uses express ip when Forwarded is unavailable", () => {
    const request = {
      headers: {},
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromForwardedHeader(request as KeyGeneratorRequest)).toBe("10.0.0.2");
  });

  it("falls back to socket remoteAddress when request ip is undefined", () => {
    const request = {
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromForwardedHeader(request as KeyGeneratorRequest)).toBe("127.0.0.1");
  });

  it("supports IPv6 values from the Forwarded header", () => {
    const request = {
      headers: { forwarded: 'for="[2001:db8:cafe::17]:4711";proto=https' },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromForwardedHeader(request as KeyGeneratorRequest)).toBe(
      "2001:db8:cafe::/56",
    );
  });

  it("falls back to request ip when Forwarded for value is unknown", () => {
    const request = {
      headers: { forwarded: "for=unknown;proto=https" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromForwardedHeader(request as KeyGeneratorRequest)).toBe("10.0.0.2");
  });

  it("falls back to request ip when Forwarded does not contain a usable for parameter", () => {
    const request = {
      headers: { forwarded: "proto=https;by=203.0.113.10" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromForwardedHeader(request as KeyGeneratorRequest)).toBe("10.0.0.2");
  });

  it("returns plain forwarded hosts without splitting", () => {
    const request = {
      headers: { forwarded: "for=client-proxy" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromForwardedHeader(request as KeyGeneratorRequest)).toBe("client-proxy");
  });

  it("ignores invalid bracketed forwarded values", () => {
    const request = {
      headers: { forwarded: 'for="[broken"' },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromForwardedHeader(request as KeyGeneratorRequest)).toBe("10.0.0.2");
  });

  it("handles an array of Forwarded header values", () => {
    const request = {
      headers: { forwarded: ["for=198.51.100.50;proto=https", "for=203.0.113.9"] },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromForwardedHeader(request as unknown as KeyGeneratorRequest)).toBe(
      "198.51.100.50",
    );
  });

  it("uses unknown when no header, request ip or socket address are available", () => {
    const request = {
      headers: {},
      socket: {},
    };

    expect(keyGeneratorFromForwardedHeader(request as KeyGeneratorRequest)).toBe("unknown");
  });
});

describe("Rate limiter authenticated key generator", () => {
  type KeyGeneratorRequest = Parameters<typeof keyGeneratorFromForwardedHeader>[0];

  it("uses the authenticated username when available", () => {
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({ name: "Rich User" }),
    } as unknown as Auth;
    const request = {
      headers: { forwarded: "for=198.51.100.50;proto=https" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromAuthenticatedUser(auth, request as KeyGeneratorRequest)).toBe(
      "user:rich%20user",
    );
  });

  it("falls back to forwarded/IP identity when username is unavailable", () => {
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({}),
    } as unknown as Auth;
    const request = {
      headers: { forwarded: "for=198.51.100.50;proto=https" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromAuthenticatedUser(auth, request as KeyGeneratorRequest)).toBe(
      "198.51.100.50",
    );
  });

  it("falls back to forwarded/IP identity when auth access throws", () => {
    const auth = {
      getToken: vi.fn().mockImplementation(() => {
        throw new Error("token error");
      }),
      getUser: vi.fn(),
    } as unknown as Auth;
    const request = {
      headers: { forwarded: "for=198.51.100.50;proto=https" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromAuthenticatedUser(auth, request as KeyGeneratorRequest)).toBe(
      "198.51.100.50",
    );
  });
});

describe("Server hardening headers", () => {
  it("applies baseline HTTP hardening headers", async () => {
    const response = await request.get("/dqs-ui/version/health");

    expect(response.statusCode).toEqual(200);
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["content-security-policy"]).toContain(
      "connect-src 'self' https://storage.googleapis.com",
    );
  });
});
