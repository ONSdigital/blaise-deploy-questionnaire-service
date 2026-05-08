import express, { type Request, type Response, type Router } from "express";

import { callCloudFunction } from "../helpers/cloudFunctionCallerHelper.js";

export default function createDonorCasesCloudFunctionHandler(CloudFunctionUrl: string): Router {
  const router = express.Router();
  const cloudFunctionHandler = new CloudFunctionHandler(CloudFunctionUrl);

  router.post("/api/cloudFunction/createDonorCases", cloudFunctionHandler.CallCloudFunction);

  return router;
}

export function reissueNewDonorCaseCloudFunctionHandler(CloudFunctionUrl: string): Router {
  const router = express.Router();
  const cloudFunctionHandler = new CloudFunctionHandler(CloudFunctionUrl);

  router.post("/api/cloudFunction/reissueNewDonorCase", cloudFunctionHandler.CallCloudFunction);

  return router;
}

export function getUsersByRoleCloudFunctionHandler(CloudFunctionUrl: string): Router {
  const router = express.Router();
  const cloudFunctionHandler = new CloudFunctionHandler(CloudFunctionUrl);

  router.post("/api/cloudFunction/getUsersByRole", cloudFunctionHandler.CallCloudFunction);

  return router;
}

class CloudFunctionHandler {
  CloudFunctionUrl: string;

  constructor(CloudFunctionUrl: string) {
    this.CloudFunctionUrl = CloudFunctionUrl;
    this.CallCloudFunction = this.CallCloudFunction.bind(this);
  }

  async CallCloudFunction(req: Request, res: Response): Promise<Response> {
    const reqData = req.body;

    req.log.info(`${this.CloudFunctionUrl} URL to invoke for Cloud Function.`);
    try {
      const cloudFunctionResponse = await callCloudFunction(this.CloudFunctionUrl, reqData);

      return res.status(cloudFunctionResponse.status).json(cloudFunctionResponse);
    } catch (error) {
      console.error("Error:", error);

      const cloudFunctionError = error as { response?: { data?: string } };

      return res.status(500).json({
        message: cloudFunctionError.response?.data,
        status: 500,
      });
    }
  }
}
