import express, { Request, Response, Router } from "express";
import axios from "axios";
import { GoogleAuth } from "google-auth-library";

export default function newCloudFunctionHandler(
    CreateDonorCasesCloudFunctionUrl: string
): Router {
    const router = express.Router();
    const cloudFunctionHandler = new CloudFunctionHandler(
        CreateDonorCasesCloudFunctionUrl
    );
    router.post(
        "/api/cloudFunction/createDonorCases",
        cloudFunctionHandler.CallCloudFunction
    );

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

export async function callCloudFunctionToCreateDonorCases(
    token: string,
    url: any,
    payload: any
) {
    console.log(token, url);
    const response = await axios.post(url, payload, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

export class CloudFunctionHandler {
    CreateDonorCasesCloudFunctionUrl: string;

    constructor(CreateDonorCasesCloudFunctionUrl: string) {
        this.CreateDonorCasesCloudFunctionUrl =
            CreateDonorCasesCloudFunctionUrl;
        this.CallCloudFunction = this.CallCloudFunction.bind(this);
    }

    async CallCloudFunction(req: Request, res: Response): Promise<Response> {
        const reqData = req.body;

        const token = await getIdTokenFromMetadataServer(
            this.CreateDonorCasesCloudFunctionUrl
        );
        req.log.info(
            `${this.CreateDonorCasesCloudFunctionUrl} URL to invoke for Creating Donor Cases.`
        );
        try {
            const response = callCloudFunctionToCreateDonorCases(
                token,
                this.CreateDonorCasesCloudFunctionUrl,
                reqData
            );
            console.log("Response:", (await response).data);
            return res.status(200).json("success");
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json();
        }
    }
}
