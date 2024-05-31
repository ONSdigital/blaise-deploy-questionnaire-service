import express, { Request, Response, Router } from "express";
import axios from "axios";
import { getConfigFromEnv } from "../config";

export default function newCloudFunctionHandler(): Router {
    const router = express.Router();
    const cloudFunctionHandler = new CloudFunctionHandler();
    router.post("/api/cloudFunction/createDonorCases", cloudFunctionHandler.CallCloudFunction);


    return router;
}

export class CloudFunctionHandler {

    constructor() {

        this.CallCloudFunction = this.CallCloudFunction.bind(this);
    }

    async CallCloudFunction(req: Request, res: Response): Promise<Response> {
        const config = getConfigFromEnv();
        const { cloudFunctionName } = req.params;
        console.log("Cloud function name: " + cloudFunctionName);
        const reqData = req.body;
        try {
            const response = await axios.post(config.CreateDonorCasesCloudFunctionUrl, reqData, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            console.log('Response:', response.data);
            return res.status(200).json("success");
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json();
        }
    }

}

