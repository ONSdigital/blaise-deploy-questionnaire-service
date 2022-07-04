import express, { Request, Response, Router } from "express";
import AuditLogger from "../auditLogging/logger";

export default function newAuditHandler(auditlogger: AuditLogger): Router {
    const router = express.Router();

    const auditHandler = new AuditHandler(auditlogger);
    return router.get("/api/audit", auditHandler.GetAuditInfo);
}

export class AuditHandler {
    auditLogger: AuditLogger;

    constructor(auditLogger: AuditLogger) {
        this.auditLogger = auditLogger;

        this.GetAuditInfo = this.GetAuditInfo.bind(this);
    }

    async GetAuditInfo(req: Request, res: Response): Promise<Response> {
        try {
            const logs = await this.auditLogger.getLogs();
            req.log.info("Retrieved audit logs");
            return res.status(200).json(logs);
        } catch (error: any) {
            req.log.error(error, "Failed calling getAuditLogs");
            return res.status(500).json(error);
        }
    }
}
