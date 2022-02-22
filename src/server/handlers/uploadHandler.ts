import { Auth } from "blaise-login-react-server";
import express, { Router, Request, Response } from "express";
import { auditLogError, auditLogInfo } from "../auditLogging";
import StorageManager from "../storage/storage";

export default function newUploadHandler(storageManager: StorageManager, auth: Auth): Router {
  const router = express.Router();

  const uploadHandler = new UploadHandler(storageManager);

  router.get("/upload/init", auth.Middleware, uploadHandler.InitialiseUpload);
  router.get("/bucket/files", auth.Middleware, uploadHandler.ListFiles);
  router.get("/upload/verify", auth.Middleware, uploadHandler.VerifyUpload);
  return router;
}

export class UploadHandler {
  storageManager: StorageManager;

  constructor(storageManager: StorageManager) {
    this.storageManager = storageManager;

    this.InitialiseUpload = this.InitialiseUpload.bind(this);
    this.ListFiles = this.ListFiles.bind(this);
    this.VerifyUpload = this.VerifyUpload.bind(this);
  }

  async InitialiseUpload(req: Request, res: Response): Promise<Response> {
    const { filename } = req.query;
    if (typeof filename !== "string") {
      return res.status(500).json("No filename provided");
    }

    try {
      const url = await this.storageManager.GetSignedUrl(filename);
      req.log.info({ url }, `Signed url for ${filename} created in Bucket ${this.storageManager.bucketName}`);
      return res.status(200).json(url);
    } catch (error: any) {
      req.log.error(error, "Failed to obtain Signed Url");
      return res.status(500).json("Failed to obtain Signed Url");
    }
  }

  async ListFiles(req: Request, res: Response): Promise<Response> {
    req.log.info("//bucket/files endpoint called");
    try {
      const bucketItems = await this.storageManager.GetBucketItems();
      req.log.info(`Obtained list of files in Bucket ${this.storageManager.bucketName}`);
      return res.status(200).json(bucketItems);
    } catch (error: any) {
      req.log.error(error, "Failed to obtain list of files in bucket");
      return res.status(500).json("Failed to list of files in bucket");
    }
  }

  async VerifyUpload(req: Request, res: Response): Promise<Response> {
    const { filename } = req.query;
    if (typeof filename !== "string") {
      return res.status(500).json("No filename provided");
    }

    try {
      const file = await this.storageManager.CheckFile(filename);
      if (!file.found) {
        req.log.warn(`File ${filename} not found in Bucket ${this.storageManager.bucketName}`);
        auditLogError(req.log, `Failed to install questionnaire ${filename}, file upload failed`);
        return res.status(404).json("Not found");
      }
      req.log.info(`File ${filename} found in Bucket ${this.storageManager.bucketName}`);
      auditLogInfo(req.log, `Successfully uploaded questionnaire file ${filename}`);
      return res.status(200).json(file);
    } catch (error: any) {
      req.log.error(error, "Failed calling checkFile");
      auditLogError(req.log, `Failed to install questionnaire ${filename}, unable to verify if file had been uploaded`);
      return res.status(500).json(error);
    }
  }
}
