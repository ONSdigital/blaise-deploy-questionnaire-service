import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

type ClientLogLevel = "log" | "info" | "warn" | "error" | "debug";

interface ClientLogPayload {
  level: ClientLogLevel;
  message: string;
  args?: string[];
  pathname?: string;
  href?: string;
  userAgent?: string;
  timestamp?: string;
  stack?: string;
}

type NormalisedClientLogLevel = Exclude<ClientLogLevel, "log">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isClientLogLevel(level: string): level is ClientLogLevel {
  switch (level) {
    case "log":
    case "info":
    case "warn":
    case "error":
    case "debug":
      return true;
    default:
      return false;
  }
}

function normaliseLevel(level: ClientLogLevel): NormalisedClientLogLevel {
  switch (level) {
    case "log":
    case "info":
      return "info";
    case "warn":
      return "warn";
    case "error":
      return "error";
    case "debug":
      return "debug";
  }
}

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\x00-\x1F\x7F\u2028\u2029]/g;

function sanitise(value: string): string {
  return value.replace(CONTROL_CHARS_RE, " ").replace(/\s+/g, " ").trim();
}

function sanitiseLogValue(value: unknown): unknown {
  if (typeof value === "string") {
    return sanitise(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitiseLogValue(item));
  }

  if (isRecord(value)) {
    const out: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
      out[key] = sanitiseLogValue(item);
    }

    return out;
  }

  return value;
}

function clamp(value: string, maxLen: number): string {
  const sanitised = sanitise(value);

  if (sanitised.length <= maxLen) {
    return sanitised;
  }

  return sanitised.slice(0, maxLen);
}

function writeClientLog(
  req: Request,
  level: NormalisedClientLogLevel,
  clientLog: ClientLogPayload,
): void {
  const safeClientLog = sanitiseLogValue(clientLog) as ClientLogPayload;
  const message = `CLIENT_LOG: ${safeClientLog.message}`;

  switch (level) {
    case "info":
      req.log.info({ clientLog: safeClientLog }, message);

      return;
    case "warn":
      req.log.warn({ clientLog: safeClientLog }, message);

      return;
    case "error":
      req.log.error({ clientLog: safeClientLog }, message);

      return;
    case "debug":
      req.log.debug({ clientLog: safeClientLog }, message);

      return;
  }
}

export default function newClientLogHandler(auth: Auth): Router {
  const router = express.Router();

  router.post("/api/client-log", auth.middleware, (req: Request, res: Response) => {
    const body = isRecord(req.body) ? req.body : {};

    if (typeof body.level !== "string") {
      return res.status(400).json({ error: "Missing level" });
    }

    if (!isClientLogLevel(body.level)) {
      return res.status(400).json({ error: "Invalid level" });
    }

    const level = normaliseLevel(body.level);

    if (typeof body.message !== "string" || body.message.trim() === "") {
      return res.status(400).json({ error: "Missing message" });
    }

    const clientLog: ClientLogPayload = {
      level: body.level,
      message: clamp(body.message, 2000),
      args: Array.isArray(body.args)
        ? body.args.slice(0, 20).map((a) => clamp(String(a), 1000))
        : undefined,
      pathname: typeof body.pathname === "string" ? clamp(body.pathname, 500) : undefined,
      href: typeof body.href === "string" ? clamp(body.href, 1000) : undefined,
      userAgent:
        typeof body.userAgent === "string"
          ? clamp(body.userAgent, 500)
          : typeof req.header("user-agent") === "string"
            ? clamp(req.header("user-agent") as string, 500)
            : undefined,
      timestamp: typeof body.timestamp === "string" ? clamp(body.timestamp, 100) : undefined,
      stack: typeof body.stack === "string" ? clamp(body.stack, 8000) : undefined,
    };

    writeClientLog(req, level, clientLog);

    return res.status(204).send();
  });

  return router;
}
