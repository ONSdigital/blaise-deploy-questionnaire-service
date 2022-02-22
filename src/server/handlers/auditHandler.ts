import express, { Request, Response, Router } from "express";
import { getAuditLogs } from "../auditLogging";

export default function AuditHandler(): Router {
  const router = express.Router();

  return router.get("/api/audit", getAuditInfo);
}

export async function getAuditInfo(req: Request, res: Response): Promise<Response> {
  try {
    const logs = await getAuditLogs();
    req.log.info("Retrieved audit logs");
    return res.status(200).json(logs);
  } catch (error: any) {
    req.log.error(error, "Failed calling getAuditLogs");
    return res.status(500).json(error);
  }
}
