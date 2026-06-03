import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import type AuditLogger from "../auditLogger.js";

export default function newAuditHandler(auditLogger: AuditLogger, auth: Auth): Router {
  const router = express.Router();

  const auditHandler = new AuditHandler(auditLogger);

  return router.get("/api/audit", auth.middleware, auditHandler.getAuditInfo);
}

class AuditHandler {
  private readonly auditLogger: AuditLogger;

  constructor(auditLogger: AuditLogger) {
    this.auditLogger = auditLogger;
  }

  getAuditInfo = async (req: Request, res: Response): Promise<Response> => {
    try {
      const logs = await this.auditLogger.getLogs();

      req.log.info("Retrieved audit logs");

      return res.status(200).json(logs);
    } catch (error: unknown) {
      req.log.error(error, "Failed calling getAuditLogs");

      return res.status(500).json({ message: "Failed to retrieve audit logs" });
    }
  };
}
