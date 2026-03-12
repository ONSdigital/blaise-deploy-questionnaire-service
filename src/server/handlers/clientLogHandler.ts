import express, { Request, Response, Router } from "express";
import { Auth } from "blaise-login-react/blaise-login-react-server";

export type ClientLogLevel = "log" | "info" | "warn" | "error" | "debug";

export interface ClientLogPayload {
    level: ClientLogLevel;
    message: string;
    args?: string[];
    pathname?: string;
    href?: string;
    userAgent?: string;
    timestamp?: string;
    stack?: string;
}

function normaliseLevel(level: string): Exclude<ClientLogLevel, "log"> | "info" | null {
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
    default:
        return null;
    }
}

function clamp(value: string, maxLen: number): string {
    if (value.length <= maxLen) {
        return value;
    }
    return value.slice(0, maxLen);
}

export default function newClientLogHandler(auth: Auth): Router {
    const router = express.Router();

    router.post("/api/client-log", auth.Middleware, (req: Request, res: Response) => {
        const body: Partial<ClientLogPayload> = req.body || {};

        if (typeof body.level !== "string") {
            return res.status(400).json({ error: "Missing level" });
        }
        const level = normaliseLevel(body.level);
        if (!level) {
            return res.status(400).json({ error: "Invalid level" });
        }

        if (typeof body.message !== "string" || body.message.trim() === "") {
            return res.status(400).json({ error: "Missing message" });
        }

        const clientLog: ClientLogPayload = {
            level: body.level as ClientLogLevel,
            message: clamp(body.message, 2000),
            args: Array.isArray(body.args) ? body.args.slice(0, 20).map((a) => clamp(String(a), 1000)) : undefined,
            pathname: typeof body.pathname === "string" ? clamp(body.pathname, 500) : undefined,
            href: typeof body.href === "string" ? clamp(body.href, 1000) : undefined,
            userAgent: typeof body.userAgent === "string" ? clamp(body.userAgent, 500) : req.header("user-agent") || undefined,
            timestamp: typeof body.timestamp === "string" ? clamp(body.timestamp, 100) : undefined,
            stack: typeof body.stack === "string" ? clamp(body.stack, 8000) : undefined,
        };

        (req.log as any)[level]({ clientLog }, `CLIENT_LOG: ${clientLog.message}`);
        return res.status(204).send();
    });

    return router;
}
