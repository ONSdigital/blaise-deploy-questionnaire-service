import { Auth } from "blaise-login-react-server";
import supertest, { type Response } from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getConfigFromEnv } from "../config";
import { newServer } from "../server";
import {
  expectedQuestionnaireList,
  questionnaireListMockObject,
  questionnaireMockObject,
} from "../test-utils/blaiseHandler.mock";

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
  const { mockLoginReactServerModule } = await import("../test-utils/loginReactServer.mock");

  return mockLoginReactServerModule();
});

Auth.prototype.ValidateToken = vi.fn().mockReturnValue(true);

const {
  mockGetQuestionnaire,
  mockGetQuestionnaires,
  mockGetQuestionnaireCaseIds,
  mockInstallQuestionnaire,
  mockDeleteQuestionnaire,
  mockActivateQuestionnaire,
  mockDeactivateQuestionnaire,
  mockDoesQuestionnaireHaveMode,
  mockGetQuestionnaireModes,
  mockGetQuestionnaireSettings,
  mockGetSurveyDays,
} = vi.hoisted(() => ({
  mockGetQuestionnaire: vi.fn(),
  mockGetQuestionnaires: vi.fn(),
  mockGetQuestionnaireCaseIds: vi.fn(),
  mockInstallQuestionnaire: vi.fn(),
  mockDeleteQuestionnaire: vi.fn(),
  mockActivateQuestionnaire: vi.fn(),
  mockDeactivateQuestionnaire: vi.fn(),
  mockDoesQuestionnaireHaveMode: vi.fn(),
  mockGetQuestionnaireModes: vi.fn(),
  mockGetQuestionnaireSettings: vi.fn(),
  mockGetSurveyDays: vi.fn(),
}));

vi.mock("blaise-api-node-client", async () => {
  const blaiseApiNodeClient = await vi.importActual("blaise-api-node-client");

  class MockBlaiseApiClient {
    constructor(_url?: string) {}

    public getQuestionnaire = mockGetQuestionnaire;
    public getQuestionnaires = mockGetQuestionnaires;
    public getQuestionnaireCaseIds = mockGetQuestionnaireCaseIds;
    public installQuestionnaire = mockInstallQuestionnaire;
    public deleteQuestionnaire = mockDeleteQuestionnaire;
    public activateQuestionnaire = mockActivateQuestionnaire;
    public deactivateQuestionnaire = mockDeactivateQuestionnaire;
    public doesQuestionnaireHaveMode = mockDoesQuestionnaireHaveMode;
    public getQuestionnaireModes = mockGetQuestionnaireModes;
    public getQuestionnaireSettings = mockGetQuestionnaireSettings;
    public getSurveyDays = mockGetSurveyDays;
  }

  return {
    __esModule: true,
    ...blaiseApiNodeClient,
    BlaiseApiClient: MockBlaiseApiClient,
    default: MockBlaiseApiClient,
  };
});

const QuestionnaireSettingsMockList = [
  {
    type: "StrictInterviewing",
    saveSessionOnTimeout: false,
    saveSessionOnQuit: true,
    deleteSessionOnTimeout: false,
    deleteSessionOnQuit: false,
    sessionTimeout: 15,
    applyRecordLocking: false,
  },
];

const config = getConfigFromEnv();
const request = supertest(newServer(config));

describe("BlaiseAPI Get all questionnaires from API", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 200 status and an empty json list when API returns a empty list", async () => {
    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.resolve([]);
    });

    const response: Response = await request.get("/api/questionnaires");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([]);
  });

  it("should return a 200 status and a json list of 3 items when API returns a 3 item list", async () => {
    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.resolve(questionnaireListMockObject);
    });

    const response: Response = await request.get("/api/questionnaires");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(expectedQuestionnaireList);
    expect(response.body.length).toStrictEqual(3);
  });

  it("should return a 500 status direct from the API", async () => {
    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/questionnaires");

    expect(response.status).toEqual(500);
  });
});

describe("BlaiseAPI Get specific questionnaire information from API", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 404 status with the data as false when API returns can't find the questionnaire", async () => {
    mockGetQuestionnaire.mockImplementation(() => {
      return Promise.reject({ response: { status: 404 }, isAxiosError: true });
    });

    const response: Response = await request.get("/api/questionnaires/OPN2004A");

    expect(response.status).toEqual(404);
    expect(response.body).toEqual("");
  });

  it("should return a 200 status and a json object when API returns a questionnaire object", async () => {
    mockGetQuestionnaire.mockImplementation(() => {
      return Promise.resolve(questionnaireMockObject);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(questionnaireMockObject);
  });

  it("should return a 500 status direct from the API", async () => {
    mockGetQuestionnaire.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A");

    expect(response.status).toEqual(500);
  });
});

describe("BlaiseAPI Post to API to install a specific questionnaire", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 201 status when API installs a questionnaire", async () => {
    mockInstallQuestionnaire.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.post("/api/install").send({ filename: "OPN2101A" });

    expect(response.status).toEqual(201);
  });

  it("should return a 500 status direct from the API", async () => {
    mockInstallQuestionnaire.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.post("/api/install").send({ filename: "OPN2101A" });

    expect(response.status).toEqual(500);
  });

  it("should send an empty questionnaire filename when payload filename is missing", async () => {
    mockInstallQuestionnaire.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.post("/api/install").send({});

    expect(response.status).toEqual(201);
    expect(mockInstallQuestionnaire).toHaveBeenCalled();
    const [, payload] = mockInstallQuestionnaire.mock.calls[0] as [
      string,
      { questionnaireFile: string },
    ];

    expect(payload.questionnaireFile).toEqual("");
  });
});

describe("BlaiseAPI Delete a specific questionnaire", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 204 status when API deletes a questionnaire successfully", async () => {
    mockDeleteQuestionnaire.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.delete("/api/questionnaires/OPN2101A");

    expect(response.status).toEqual(204);
  });

  it("should return a 404 status direct from the API", async () => {
    mockDeleteQuestionnaire.mockImplementation(() => {
      return Promise.reject({ response: { status: 404 }, isAxiosError: true });
    });

    const response: Response = await request.delete("/api/questionnaires/OPN2101A");

    expect(response.status).toEqual(404);
  });

  it("should return a 500 status direct from the API", async () => {
    mockDeleteQuestionnaire.mockImplementation(() => {
      return Promise.reject({ response: { status: 500 }, isAxiosError: true });
    });

    const response: Response = await request.delete("/api/questionnaires/OPN2101A");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when error shape is not axios-like", async () => {
    mockDeleteQuestionnaire.mockImplementation(() => {
      return Promise.reject({ isAxiosError: true });
    });

    const response: Response = await request.delete("/api/questionnaires/OPN2101A");

    expect(response.status).toEqual(500);
  });
});

describe("BlaiseAPI get case IDs", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 200 status and case IDs list when API succeeds", async () => {
    mockGetQuestionnaireCaseIds.mockImplementation(() => {
      return Promise.resolve(["10001", "10002"]);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/cases/ids");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(["10001", "10002"]);
  });

  it("should return a 500 status when case ID lookup fails", async () => {
    mockGetQuestionnaireCaseIds.mockImplementation(() => {
      return Promise.reject(new Error("failed"));
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/cases/ids");

    expect(response.status).toEqual(500);
  });
});

describe("BlaiseAPI Activate a specific questionnaire", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 204 status when API activates a questionnaire successfully", async () => {
    mockActivateQuestionnaire.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.patch("/api/questionnaires/OPN2101A/activate");

    expect(response.status).toEqual(204);
  });

  it("should return a 404 status direct from the API", async () => {
    mockActivateQuestionnaire.mockImplementation(() => {
      return Promise.reject({ response: { status: 404 }, isAxiosError: true });
    });

    const response: Response = await request.patch("/api/questionnaires/OPN2101A/activate");

    expect(response.status).toEqual(404);
  });

  it("should return a 500 status direct from the API", async () => {
    mockActivateQuestionnaire.mockImplementation(() => {
      return Promise.reject({ response: { status: 500 }, isAxiosError: true });
    });

    const response: Response = await request.patch("/api/questionnaires/OPN2101A/activate");

    expect(response.status).toEqual(500);
  });
});

describe("BlaiseAPI Deactivate a specific questionnaire", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 204 status when API activates a questionnaire successfully", async () => {
    mockDeactivateQuestionnaire.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.patch("/api/questionnaires/OPN2101A/deactivate");

    expect(response.status).toEqual(204);
  });

  it("should return a 404 status direct from the API", async () => {
    mockDeactivateQuestionnaire.mockImplementation(() => {
      return Promise.reject({ response: { status: 404 }, isAxiosError: true });
    });

    const response: Response = await request.patch("/api/questionnaires/OPN2101A/deactivate");

    expect(response.status).toEqual(404);
  });

  it("should return a 500 status direct from the API", async () => {
    mockDeactivateQuestionnaire.mockImplementation(() => {
      return Promise.reject({ response: { status: 500 }, isAxiosError: true });
    });

    const response: Response = await request.patch("/api/questionnaires/OPN2101A/deactivate");

    expect(response.status).toEqual(500);
  });
});

describe("BlaiseAPI does questionnaire have a specific mode API", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 200 status and a json boolean when API returns a boolean", async () => {
    mockDoesQuestionnaireHaveMode.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/modes/CAWI");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(true);
  });

  it("should return a 500 status direct from the API", async () => {
    mockDoesQuestionnaireHaveMode.mockImplementation(() => {
      return Promise.reject(true);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/modes/CAWI");

    expect(response.status).toEqual(500);
  });
});

describe("BlaiseAPI get questionnaire modes", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 200 status and an empty json list when API returns a empty list", async () => {
    mockGetQuestionnaireModes.mockImplementation(() => {
      return Promise.resolve([]);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/modes");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([]);
  });

  it("should return a 200 status and a json list of 2 items when API returns a 2 item list", async () => {
    mockGetQuestionnaireModes.mockImplementation(() => {
      return Promise.resolve(["CATI", "CAWI"]);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/modes");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(["CATI", "CAWI"]);
    expect(response.body.length).toStrictEqual(2);
  });

  it("should return a 500 status direct from the API", async () => {
    mockGetQuestionnaireModes.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/modes");

    expect(response.status).toEqual(500);
  });
});

describe("BlaiseAPI get questionnaire settings", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 200 status and an empty json list when API returns a empty list", async () => {
    mockGetQuestionnaireSettings.mockImplementation(() => {
      return Promise.resolve([]);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/settings");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([]);
  });

  it("should return a 200 status and a json object when API returns an questionnaire settings object", async () => {
    mockGetQuestionnaireSettings.mockImplementation(() => {
      return Promise.resolve(QuestionnaireSettingsMockList);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/settings");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(QuestionnaireSettingsMockList);
  });

  it("should return a 500 status direct from the API", async () => {
    mockGetQuestionnaireSettings.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/settings");

    expect(response.status).toEqual(500);
  });
});

describe("BlaiseAPI get survey days", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 200 status and an empty json list when API returns a empty list", async () => {
    mockGetSurveyDays.mockImplementation(() => {
      return Promise.resolve([]);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/surveydays");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([]);
  });

  it("should return a 200 status and a json list of 2 items when API returns a 2 item list", async () => {
    mockGetSurveyDays.mockImplementation(() => {
      return Promise.resolve(["2021-10-05T00:00:00", "2021-10-06T00:00:00"]);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/surveydays");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(["2021-10-05T00:00:00", "2021-10-06T00:00:00"]);
    expect(response.body.length).toStrictEqual(2);
  });

  it("should return a 500 status direct from the API", async () => {
    mockGetSurveyDays.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/surveydays");

    expect(response.status).toEqual(500);
  });
});

describe("BlaiseAPI get active survey-day status", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return true when survey days exist", async () => {
    mockGetSurveyDays.mockImplementation(() => {
      return Promise.resolve(["2021-10-05T00:00:00"]);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/active");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(true);
  });

  it("should return false when survey days do not exist", async () => {
    mockGetSurveyDays.mockImplementation(() => {
      return Promise.resolve([]);
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/active");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(false);
  });

  it("should return 500 when survey day lookup fails", async () => {
    mockGetSurveyDays.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/questionnaires/OPN2101A/active");

    expect(response.status).toEqual(500);
  });
});
