import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import { callCloudFunction } from "../helpers/cloudFunctionCallerHelper.js";

import type AuditLogger from "../auditLogger.js";

type AuditMessages = {
  successMessage: string;
  errorMessage: string;
};

type BuildAuditMessages = (req: Request, username: string) => AuditMessages;

export default function newCloudFunctionHandler(
  routePath: string,
  cloudFunctionUrl: string,
  auth?: Auth,
  auditLogger?: AuditLogger,
  buildAuditMessages?: BuildAuditMessages,
): Router {
  const router = express.Router();
  const handler = new CloudFunctionHandler(cloudFunctionUrl, auth, auditLogger, buildAuditMessages);

  if (auth != null) {
    router.post(routePath, auth.middleware, handler.callCloudFunction);

    return router;
  }

  router.post(routePath, handler.callCloudFunction);

  return router;
}

class CloudFunctionHandler {
  private readonly cloudFunctionUrl: string;
  private readonly auth?: Auth;
  private readonly auditLogger?: AuditLogger;
  private readonly buildAuditMessages?: BuildAuditMessages;

  constructor(
    cloudFunctionUrl: string,
    auth?: Auth,
    auditLogger?: AuditLogger,
    buildAuditMessages?: BuildAuditMessages,
  ) {
    this.cloudFunctionUrl = cloudFunctionUrl;
    this.auth = auth;
    this.auditLogger = auditLogger;
    this.buildAuditMessages = buildAuditMessages;
  }

  callCloudFunction = async (req: Request, res: Response): Promise<Response> => {
    const username = this.auth?.getUser(this.auth.getToken(req))?.name;

    req.log.info(`${this.cloudFunctionUrl} URL to invoke for Cloud Function.`);
    try {
      const cloudFunctionResponse = await callCloudFunction(this.cloudFunctionUrl, req.body);
      const isSuccess = cloudFunctionResponse.status >= 200 && cloudFunctionResponse.status < 300;

      if (this.auditLogger != null && this.buildAuditMessages != null && username != null) {
        if (isSuccess) {
          this.auditLogger.info(req.log, this.buildAuditMessages(req, username).successMessage);
        } else {
          this.auditLogger.error(req.log, this.buildAuditMessages(req, username).errorMessage);
        }
      }

      return res.status(200).json(cloudFunctionResponse);
    } catch (error: unknown) {
      req.log.error(error, "Cloud function call failed");

      if (this.auditLogger != null && this.buildAuditMessages != null && username != null) {
        this.auditLogger.error(req.log, this.buildAuditMessages(req, username).errorMessage);
      }

      return res.status(500).json({
        message: getCloudFunctionErrorMessage(error),
        status: 500,
      });
    }
  };
}

function getCloudFunctionErrorMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const response = error.response;

  if (typeof response !== "object" || response === null || !("data" in response)) {
    return undefined;
  }

  return typeof response.data === "string" ? response.data : undefined;
}
