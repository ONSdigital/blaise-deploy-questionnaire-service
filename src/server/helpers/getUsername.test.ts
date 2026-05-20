import { type Auth } from "blaise-login-react-server";
import { type Request } from "express";
import { describe, expect, it } from "vitest";

import { getUsername } from "./getUsername.js";

function makeAuth(userName: string | undefined): Auth {
  return {
    getToken: (_req: Request) => "token",
    getUser: (_token: string | null) => (userName !== undefined ? { name: userName } : undefined),
  } as unknown as Auth;
}

describe("getUsername", () => {
  const req = {} as Request;

  it("returns the sanitised user name when a user is found", () => {
    expect(getUsername(req, makeAuth("test user"))).toBe("test user");
  });

  it("returns 'Unknown User' when getUser returns undefined", () => {
    expect(getUsername(req, makeAuth(undefined))).toBe("Unknown User");
  });
});
