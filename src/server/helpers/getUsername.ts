import { type Auth } from "blaise-login-react-server";
import { type Request } from "express";

import { sanitise } from "./sanitise.js";

export function getUsername(req: Request, auth: Auth): string {
  return sanitise(auth.getUser(auth.getToken(req))?.name ?? "Unknown User");
}
