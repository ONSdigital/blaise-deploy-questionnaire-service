import express, { Request, Response, Router } from "express";
import { getConfigFromEnv } from "../config";
import axios from "axios";
import { GoogleAuth } from "google-auth-library";

export default function newCloudFunctionHandler(): Router {
    const router = express.Router();
    const cloudFunctionHandler = new CloudFunctionHandler();
    router.post("/api/cloudFunction/createDonorCases", cloudFunctionHandler.CallCloudFunction);

    return router;
}

async function getIdTokenFromMetadataServer(targetAudience: string) {
    const googleAuth = new GoogleAuth();

    const client = await googleAuth.getIdTokenClient(targetAudience);

    // Get the ID token.
    // Once you've obtained the ID token, you can use it to make an authenticated call
    // to the target audience.
    const token = await client.idTokenProvider.fetchIdToken(targetAudience);
    return token;
}
export class CloudFunctionHandler {

    constructor() {
        this.CallCloudFunction = this.CallCloudFunction.bind(this);
    }

    async CallCloudFunction(req: Request, res: Response): Promise<Response> {
        const reqData = req.body;
        const config = getConfigFromEnv();
        const token = await getIdTokenFromMetadataServer(config.CreateDonorCasesCloudFunctionUrl);

        try {
            const response = await axios.post(config.CreateDonorCasesCloudFunctionUrl, reqData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            console.log("Response:", response.data);
            return res.status(200).json("success");
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json();
        }

    }

}

