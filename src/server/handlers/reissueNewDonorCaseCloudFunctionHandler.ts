import express, { Request, Response, Router } from "express";
import { callCloudFunctionToReissueNewDonorDonorCase } from "../helpers/cloudFunctionCallerHelper";

export default function newCloudFunctionHandler(
    ReissueNewDonorCaseCloudFunctionUrl: string
): Router {
    const router = express.Router();
    const cloudFunctionHandler = new CloudFunctionHandler(
        ReissueNewDonorCaseCloudFunctionUrl
    );
    router.post("/api/cloudFunction/reissueNewDonorCase", cloudFunctionHandler.CallCloudFunction);

    return router;
}

export class CloudFunctionHandler {
    ReissueNewDonorCaseCloudFunctionUrl: string;

    constructor(ReissueNewDonorCaseCloudFunctionUrl: string) {
        this.ReissueNewDonorCaseCloudFunctionUrl = ReissueNewDonorCaseCloudFunctionUrl;
        this.CallCloudFunction = this.CallCloudFunction.bind(this);
    }

    async CallCloudFunction(req: Request, res: Response): Promise<Response> {
        const reqData = req.body;
        req.log.info(`${this.ReissueNewDonorCaseCloudFunctionUrl} URL to invoke for Reissuing New Donor Case.`);
        try {
            const cloudFunctionResponse = await callCloudFunctionToReissueNewDonorDonorCase(this.ReissueNewDonorCaseCloudFunctionUrl, reqData);
            return res.status(cloudFunctionResponse.status).json(cloudFunctionResponse);

        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({
                message: (error as any)?.response.data,
                status: 500,
            });
        }
    }
}
