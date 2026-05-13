import express from "express";
import supertest from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import newHealthCheckHandler from "./healthCheckHandler.js";

function createApp() {
  const app = express();

  app.use(newHealthCheckHandler());

  return app;
}

describe("Test Health Endpoint", () => {
  let request: supertest.Agent;

  beforeEach(() => {
    request = supertest(createApp());
  });

  it("should return a 200 status and json message", async () => {
    const response = await request.get("/dqs-ui/version/health");

    expect(response.statusCode).toEqual(200);
    expect(response.body).toStrictEqual({ healthy: true });
  });
});

describe("App Engine lifecycle endpoints", () => {
  let request: supertest.Agent;

  beforeEach(() => {
    request = supertest(createApp());
  });
  it("/_ah/start should return 200", async () => {
    const response = await request.get("/_ah/start");

    expect(response.statusCode).toEqual(200);
  });

  it("/_ah/stop should return 200", async () => {
    const response = await request.get("/_ah/stop");

    expect(response.statusCode).toEqual(200);
  });
});
