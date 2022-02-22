import supertest, { Response } from "supertest";
import { expectedInstrumentList } from "./mockObjects";
import { Auth } from "blaise-login-react-server";
import BlaiseApiRest from "blaise-api-node-client";
import { newServer } from "../server";

jest.mock("blaise-login-react-server", () => {
  const loginReact = jest.requireActual("blaise-login-react-server");
  return {
    ...loginReact
  };
});
Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);

jest.mock("blaise-api-node-client");
const { DiagnosticMockObject, InstrumentListMockObject, InstrumentMockObject, InstrumentSettingsMockList } = jest.requireActual("blaise-api-node-client");

const mockGetDiagnostics = jest.fn();
const mockGetInstrumentWithCatiData = jest.fn();
const mockGetInstrumentsWithCatiData = jest.fn();
const mockInstrumentExists = jest.fn();
const mockInstallInstrument = jest.fn();
const mockDeleteInstrument = jest.fn();
const mockActivateInstrument = jest.fn();
const mockDeactivateInstrument = jest.fn();
const mockDoesInstrumentHaveMode = jest.fn();
const mockGetInstrumentModes = jest.fn();
const mockGetInstrumentSettings = jest.fn();

BlaiseApiRest.prototype.getDiagnostics = mockGetDiagnostics;
BlaiseApiRest.prototype.getInstrumentWithCatiData = mockGetInstrumentWithCatiData;
BlaiseApiRest.prototype.getInstrumentsWithCatiData = mockGetInstrumentsWithCatiData;
BlaiseApiRest.prototype.instrumentExists = mockInstrumentExists;
BlaiseApiRest.prototype.installInstrument = mockInstallInstrument;
BlaiseApiRest.prototype.deleteInstrument = mockDeleteInstrument;
BlaiseApiRest.prototype.activateInstrument = mockActivateInstrument;
BlaiseApiRest.prototype.deactivateInstrument = mockDeactivateInstrument;
BlaiseApiRest.prototype.doesInstrumentHaveMode = mockDoesInstrumentHaveMode;
BlaiseApiRest.prototype.getInstrumentModes = mockGetInstrumentModes;
BlaiseApiRest.prototype.getInstrumentSettings = mockGetInstrumentSettings;


// Mock Express Server
const request = supertest(newServer());

describe("BlaiseAPI Get health Check from API", () => {
  it("should return a 200 status and a json list of 4 items when API returns a 4 item list", async () => {
    mockGetDiagnostics.mockImplementation(() => {
      return Promise.resolve(DiagnosticMockObject);
    });

    const response: Response = await request.get("/api/health/diagnosis");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(DiagnosticMockObject);
    expect(response.body.length).toStrictEqual(4);
  });

  it("should return a 500 status direct from the API", async () => {
    mockGetDiagnostics.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/health/diagnosis");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});

describe("BlaiseAPI Get all instruments from API", () => {
  it("should return a 200 status and an empty json list when API returns a empty list", async () => {
    mockGetInstrumentsWithCatiData.mockImplementation(() => {
      return Promise.resolve([]);
    });

    const response: Response = await request.get("/api/instruments");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([]);
  });

  it("should return a 200 status and a json list of 3 items when API returns a 3 item list", async () => {
    mockGetInstrumentsWithCatiData.mockImplementation(() => {
      return Promise.resolve(InstrumentListMockObject);
    });

    const response: Response = await request.get("/api/instruments");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(expectedInstrumentList);
    expect(response.body.length).toStrictEqual(3);
  });

  it("should return a 500 status direct from the API", async () => {
    mockGetInstrumentsWithCatiData.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/instruments");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});

describe("BlaiseAPI Get specific instrument information from API", () => {
  it("should return a 404 status with the data as false when API returns can't find the instrument", async () => {
    mockInstrumentExists.mockImplementation(() => {
      return Promise.resolve(false);
    });

    const response: Response = await request.get("/api/instruments/OPN2004A");

    expect(response.status).toEqual(404);
    expect(response.body).toEqual(null);

  });

  it("should return a 200 status and a json object when API returns a instrument object", async () => {
    mockInstrumentExists.mockImplementation(() => {
      return Promise.resolve(true);
    });
    mockGetInstrumentWithCatiData.mockImplementation(() => {
      return Promise.resolve(InstrumentMockObject);
    });

    const response: Response = await request.get("/api/instruments/OPN2101A");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(InstrumentMockObject);
  });

  it("should return a 500 status direct from the API", async () => {
    mockInstrumentExists.mockImplementation(() => {
      return Promise.resolve(true);
    });
    mockGetInstrumentWithCatiData.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/instruments/OPN2101A");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});

describe("BlaiseAPI Post to API to install a specific instrument", () => {
  it("should return a 201 status when API installs a instrument", async () => {
    mockInstallInstrument.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.get("/api/install?filename=OPN2101A");

    expect(response.status).toEqual(201);
  });

  it("should return a 500 status direct from the API", async () => {
    mockInstallInstrument.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/install?filename=OPN2101A");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});

describe("BlaiseAPI Delete a specific instrument", () => {
  it("should return a 204 status when API deletes a instrument successfuly", async () => {
    mockDeleteInstrument.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.delete("/api/instruments/OPN2101A");

    expect(response.status).toEqual(204);
  });

  it("should return a 404 status direct from the API", async () => {
    mockDeleteInstrument.mockImplementation(() => {
      return Promise.reject({ status: 404 });
    });

    const response: Response = await request.delete("/api/instruments/OPN2101A");

    expect(response.status).toEqual(404);
  });

  it("should return a 500 status direct from the API", async () => {
    mockDeleteInstrument.mockImplementation(() => {
      return Promise.reject({ status: 500 });
    });

    const response: Response = await request.delete("/api/instruments/OPN2101A");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});

describe("BlaiseAPI Activate a specific instrument", () => {
  it("should return a 204 status when API activates a instrument successfuly", async () => {
    mockActivateInstrument.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.patch("/api/instruments/OPN2101A/activate");

    expect(response.status).toEqual(204);
  });

  it("should return a 404 status direct from the API", async () => {
    mockActivateInstrument.mockImplementation(() => {
      return Promise.reject({ status: 404 });
    });

    const response: Response = await request.patch("/api/instruments/OPN2101A/activate");

    expect(response.status).toEqual(404);
  });

  it("should return a 500 status direct from the API", async () => {
    mockActivateInstrument.mockImplementation(() => {
      return Promise.reject({ status: 500 });
    });

    const response: Response = await request.patch("/api/instruments/OPN2101A/activate");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});

describe("BlaiseAPI Deactivate a specific instrument", () => {
  it("should return a 204 status when API activates a instrument successfuly", async () => {
    mockDeactivateInstrument.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.patch("/api/instruments/OPN2101A/deactivate");

    expect(response.status).toEqual(204);
  });

  it("should return a 404 status direct from the API", async () => {
    mockDeactivateInstrument.mockImplementation(() => {
      return Promise.reject({ status: 404 });
    });

    const response: Response = await request.patch("/api/instruments/OPN2101A/deactivate");

    expect(response.status).toEqual(404);
  });

  it("should return a 500 status direct from the API", async () => {
    mockDeactivateInstrument.mockImplementation(() => {
      return Promise.reject({ status: 500 });
    });

    const response: Response = await request.patch("/api/instruments/OPN2101A/deactivate");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});

describe("BlaiseAPI does instrument have a specific mode API", () => {
  it("should return a 200 status and a json boolean when API returns a boolean", async () => {
    mockDoesInstrumentHaveMode.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.get("/api/instruments/OPN2101A/modes/CAWI");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(true);
  });

  it("should return a 500 status direct from the API", async () => {
    mockDoesInstrumentHaveMode.mockImplementation(() => {
      return Promise.reject(true);
    });

    const response: Response = await request.get("/api/instruments/OPN2101A/modes/CAWI");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});

describe("BlaiseAPI get instrument modes", () => {
  it("should return a 200 status and an empty json list when API returns a empty list", async () => {
    mockGetInstrumentModes.mockImplementation(() => {
      return Promise.resolve([]);
    });

    const response: Response = await request.get("/api/instruments/OPN2101A/modes");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([]);
  });

  it("should return a 200 status and a json list of 2 items when API returns a 2 item list", async () => {
    mockGetInstrumentModes.mockImplementation(() => {
      return Promise.resolve(["CATI", "CAWI"]);
    });

    const response: Response = await request.get("/api/instruments/OPN2101A/modes");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(["CATI", "CAWI"]);
    expect(response.body.length).toStrictEqual(2);
  });

  it("should return a 500 status direct from the API", async () => {
    mockGetInstrumentModes.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/instruments/OPN2101A/modes");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});

describe("BlaiseAPI get instrument settings", () => {
  it("should return a 200 status and an empty json list when API returns a empty list", async () => {
    mockGetInstrumentSettings.mockImplementation(() => {
      return Promise.resolve([]);
    });

    const response: Response = await request.get("/api/instruments/OPN2101A/settings");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([]);
  });

  it("should return a 200 status and a json object when API returns an instrument settings object", async () => {
    mockGetInstrumentSettings.mockImplementation(() => {
      return Promise.resolve(InstrumentSettingsMockList);
    });


    const response: Response = await request.get("/api/instruments/OPN2101A/settings");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(InstrumentSettingsMockList);
  });

  it("should return a 500 status direct from the API", async () => {
    mockGetInstrumentSettings.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/instruments/OPN2101A/settings");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});
