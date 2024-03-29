import { newServer } from "../server";
import supertest from "supertest";
import { getConfigFromEnv } from "../config";

const config = getConfigFromEnv();
const request = supertest(newServer(config));

describe("Test Health Endpoint", () => {
    it("should return a 200 status and json message", async () => {
        const response = await request.get("/dqs-ui/version/health");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({ healthy: true });
    });
});
