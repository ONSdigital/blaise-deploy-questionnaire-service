import path from "path";

import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import type AuditLogger from "../auditLogger.js";
import type StorageManager from "../storageManager.js";

const ALLOWED_SIGNED_URL_HOSTS = ["storage.googleapis.com"];

function isSafeFilename(filename: string): boolean {
  const basename = path.basename(filename);

  return basename === filename && !filename.includes("/") && !filename.includes("\\");
}

function isAllowedSignedUrlHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);

    return ALLOWED_SIGNED_URL_HOSTS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`),
    );
  } catch {
    return false;
  }
}

export default function newUploadHandler(
  storageManager: StorageManager,
  auth: Auth,
  auditLogger: AuditLogger,
): Router {
  const router = express.Router();

  const uploadHandler = new UploadHandler(storageManager, auditLogger);

  router.get("/upload/init", auth.Middleware, uploadHandler.initialiseUpload);
  router.get("/bucket/files", auth.Middleware, uploadHandler.listFiles);
  router.get("/upload/verify", auth.Middleware, uploadHandler.verifyUpload);

  return router;
}

class UploadHandler {
  storageManager: StorageManager;
  auditLogger: AuditLogger;

  constructor(storageManager: StorageManager, auditLogger: AuditLogger) {
    this.storageManager = storageManager;
    this.auditLogger = auditLogger;
  }

  initialiseUpload = async (req: Request, res: Response): Promise<Response> => {
    const { filename } = req.query;

    if (typeof filename !== "string" || filename.trim() === "") {
      return res.status(400).json("No filename provided");
    }

    if (!isSafeFilename(filename)) {
      req.log.warn({ filename }, "Rejected unsafe filename in upload init");

      return res.status(400).json("Invalid filename");
    }

    try {
      const url = await this.storageManager.GetSignedUrl(filename);

      if (!isAllowedSignedUrlHost(url)) {
        req.log.error({ url }, "Signed URL returned unexpected host");

        return res.status(500).json("Failed to obtain Signed Url");
      }

      req.log.info(
        { url },
        `Signed url for ${filename} created in Bucket ${this.storageManager.bucketName}`,
      );

      return res.status(200).json(url);
    } catch (error: unknown) {
      req.log.error(error, "Failed to obtain Signed Url");

      return res.status(500).json("Failed to obtain Signed Url");
    }
  };

  listFiles = async (req: Request, res: Response): Promise<Response> => {
    req.log.info("/bucket/files endpoint called");
    try {
      const bucketItems = await this.storageManager.GetBucketItems();

      req.log.info(`Obtained list of files in Bucket ${this.storageManager.bucketName}`);

      return res.status(200).json(bucketItems);
    } catch (error: unknown) {
      req.log.error(error, "Failed to obtain list of files in bucket");

      return res.status(500).json("Failed to list files in bucket");
    }
  };

  verifyUpload = async (req: Request, res: Response): Promise<Response> => {
    const { filename } = req.query;

    if (typeof filename !== "string" || filename.trim() === "") {
      return res.status(400).json("No filename provided");
    }

    if (!isSafeFilename(filename)) {
      req.log.warn({ filename }, "Rejected unsafe filename in upload verify");

      return res.status(400).json("Invalid filename");
    }

    try {
      const file = await this.storageManager.CheckFile(filename);

      if (!file.found) {
        req.log.warn(`File ${filename} not found in Bucket ${this.storageManager.bucketName}`);
        this.auditLogger.error(
          req.log,
          `Failed to install questionnaire ${filename}, file upload failed`,
        );

        return res.status(404).json("Not found");
      }

      req.log.info(`File ${filename} found in Bucket ${this.storageManager.bucketName}`);
      this.auditLogger.info(req.log, `Successfully uploaded questionnaire file ${filename}`);

      return res.status(200).json(file);
    } catch (error: unknown) {
      req.log.error(error, "Failed calling checkFile");
      this.auditLogger.error(
        req.log,
        `Failed to install questionnaire ${filename}, unable to verify if file had been uploaded`,
      );

      return res.status(500).json(error);
    }
  };
}
