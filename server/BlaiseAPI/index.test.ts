import app from "../server"; // Link to your server file
import supertest, {Response} from "supertest";
import {expectedInstrumentList} from "./mockObjects";

jest.mock("blaise-api-node-client");
import BlaiseApiRest from "blaise-api-node-client";
const {DiagnosticMockObject, InstrumentListMockObject, InstrumentMockObject} = jest.requireActual("blaise-api-node-client");

// Mock Express Server
const request = supertest(app);


describe("BlaiseAPI Get health Check from API", () => {
    it("should return a 200 status and an json list of 4 items when API returns a 4 item list", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                getDiagnostics: () => {
                    return Promise.resolve(DiagnosticMockObject);
                },
            };
        });

        const response: Response = await request.get("/api/health/diagnosis");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(DiagnosticMockObject);
        expect(response.body.length).toStrictEqual(4);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                getDiagnostics: () => {
                    return Promise.reject();
                },
            };
        });

        const response: Response = await request.get("/api/health/diagnosis");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
});

describe("BlaiseAPI Get all instruments from API", () => {
    it("should return a 200 status and an empty json list when API returns a empty list", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                getInstrumentsWithCatiData: () => {
                    return Promise.resolve([]);
                },
            };
        });

        const response: Response = await request.get("/api/instruments");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
        done();
    });

    it("should return a 200 status and an json list of 3 items when API returns a 3 item list", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                getInstrumentsWithCatiData: () => {
                    return Promise.resolve(InstrumentListMockObject);
                },
            };
        });

        const response: Response = await request.get("/api/instruments");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(expectedInstrumentList);
        expect(response.body.length).toStrictEqual(3);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                getInstrumentsWithCatiData: () => {
                    return Promise.reject();
                },
            };
        });

        const response: Response = await request.get("/api/instruments");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
});


describe("BlaiseAPI Get specific instrument information from API", () => {
    it("should return a 404 status with the data as false when API returns can't find the instrument", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                instrumentExists: () => {
                    return Promise.resolve(false);
                },
            };
        });

        const response: Response = await request.get("/api/instruments/OPN2004A");

        expect(response.status).toEqual(404);
        expect(response.body).toEqual(null);

        done();
    });

    it("should return a 200 status and an json object when API returns a instrument object", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                instrumentExists: () => {
                    return Promise.resolve(true);
                },
                getInstrumentWithCatiData: () => {
                    return Promise.resolve(InstrumentMockObject);
                }
            };
        });

        const response: Response = await request.get("/api/instruments/OPN2101A");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(InstrumentMockObject);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                instrumentExists: () => {
                    return Promise.resolve(true);
                },
                getInstrumentWithCatiData: () => {
                    return Promise.reject();
                }
            };
        });

        const response: Response = await request.get("/api/instruments/OPN2101A");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
});


describe("BlaiseAPI Post to API to install a specific instrument", () => {
    it("should return a 201 status when API installs a instrument", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                installInstrument: () => {
                    return Promise.resolve(true);
                }
            };
        });

        const response: Response = await request.get("/api/install?filename=OPN2101A");

        expect(response.status).toEqual(201);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                installInstrument: () => {
                    return Promise.reject();
                }
            };
        });

        const response: Response = await request.get("/api/install?filename=OPN2101A");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
});


describe("BlaiseAPI Delete a specific instrument", () => {
    it("should return a 204 status when API deletes a instrument successfuly", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                deleteInstrument: () => {
                    return Promise.resolve(true);
                }
            };
        });
        const response: Response = await request.delete("/api/instruments/OPN2101A");

        expect(response.status).toEqual(204);
        done();
    });

    it("should return a 404 status direct from the API", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                deleteInstrument: () => {
                    return Promise.reject({status: 404});
                }
            };
        });

        const response: Response = await request.delete("/api/instruments/OPN2101A");

        expect(response.status).toEqual(404);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                deleteInstrument: () => {
                    return Promise.reject({status: 500});
                }
            };
        });

        const response: Response = await request.delete("/api/instruments/OPN2101A");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
});

