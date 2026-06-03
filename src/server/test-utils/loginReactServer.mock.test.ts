import express, { type Request, type Response } from "express";
import supertest from "supertest";
import { describe, expect, it, vi } from "vitest";

import { mockLoginReactServerModule } from "./loginReactServer.mock.js";

describe("mockLoginReactServerModule", () => {
  it("returns Auth mock with expected behavior", () => {
    const module = mockLoginReactServerModule();
    const auth = new module.Auth({});

    expect(auth.validateToken()).toBe(true);
    expect(auth.getToken()).toBe("example-token");
    expect(auth.getUser()).toEqual({ name: "rich" });

    const next = vi.fn();

    auth.middleware({} as Request, {} as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns login handler middleware that calls next", async () => {
    const module = mockLoginReactServerModule();
    const app = express();

    app.use(module.newLoginHandler());
    app.get("/ping", (_req, res) => {
      res.status(200).json({ ok: true });
    });

    const response = await supertest(app).get("/ping");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
