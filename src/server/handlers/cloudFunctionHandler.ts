import express, { Request, Response, Router } from "express";
import { callCloudFunctionToCreateDonorCases } from "../helpers/cloudFunctionCallerHelper";

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

export class CloudFunctionHandler {
    CreateDonorCasesCloudFunctionUrl: string;

    constructor(CreateDonorCasesCloudFunctionUrl: string) {
        this.CreateDonorCasesCloudFunctionUrl = CreateDonorCasesCloudFunctionUrl;
        this.CallCloudFunction = this.CallCloudFunction.bind(this);
    }

    async CallCloudFunction(req: Request, res: Response): Promise<Response> {
        const reqData = req.body;
        req.log.info(`${this.CreateDonorCasesCloudFunctionUrl} URL to invoke for Creating Donor Cases.`);
        try {
            const cloudfunctionResponse = await callCloudFunctionToCreateDonorCases(this.CreateDonorCasesCloudFunctionUrl, reqData);
            if (cloudfunctionResponse.status == 200)
                return res.status(200).json(cloudfunctionResponse);
            else
                return res.status(cloudfunctionResponse.status).json(cloudfunctionResponse);

        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({
                message: "Error invoking the cloud function",
                status: 500,
            });
        }
    }
}
