import express, { Request, Response, Router } from "express";
import { callCloudFunction } from "../helpers/cloudFunctionCallerHelper";

export default function newCloudFunctionHandler(
    CreateDonorCasesCloudFunctionUrl: string
): Router {
    const router = express.Router();
    const cloudFunctionHandler = new CloudFunctionHandler(
        CreateDonorCasesCloudFunctionUrl
    );
    router.post("/api/cloudFunction/createDonorCases", cloudFunctionHandler.CallCloudFunction);

    return router;
}

export function reissueNewDonorCaseCloudFunctionHandler(
    CloudFunctionUrl: string
): Router {
    const router = express.Router();
    const cloudFunctionHandler = new CloudFunctionHandler(
        CloudFunctionUrl
    );
    router.post("/api/cloudFunction/reissueNewDonorCase", cloudFunctionHandler.CallCloudFunction);

    return router;
}

export class CloudFunctionHandler {
    CloudFunctionUrl: string;

    constructor(CreateDonorCasesCloudFunctionUrl: string) {
        this.CloudFunctionUrl = CreateDonorCasesCloudFunctionUrl;
        this.CallCloudFunction = this.CallCloudFunction.bind(this);
    }

    async CallCloudFunction(req: Request, res: Response): Promise<Response> {
        const reqData = req.body;
        req.log.info(`${this.CloudFunctionUrl} URL to invoke for Creating Donor Cases.`);
        try {
            const cloudfunctionResponse = await callCloudFunction(this.CloudFunctionUrl, reqData);
            return res.status(cloudfunctionResponse.status).json(cloudfunctionResponse);

        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({
                message: (error as any)?.response.data,
                status: 500,
            });
        }
    }
}
