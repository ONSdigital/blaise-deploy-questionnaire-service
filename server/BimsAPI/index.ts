import {EnvironmentVariables} from "../Config";
import express, {Request, Response, Router} from "express";
import {SendAPIRequest} from "../SendRequest";
import AuthProvider from "../AuthProvider";

export default function BimsAPIRouter(environmentVariables: EnvironmentVariables, logger: any): Router {
    const {BIMS_API_URL, BIMS_CLIENT_ID}: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    const authProvider = new AuthProvider(BIMS_CLIENT_ID);

    router.post("/api/livedate/:instrumentName", async function (req: Request, res: Response) {
        const {instrumentName} = req.params;
        const data = req.body;

        const url = `${BIMS_API_URL}/livedate/${instrumentName}`;

        const authHeader = await authProvider.getAuthHeader();
        req.log.info(authHeader, "Obtained Google auth request header");

        const [status, result, contentType] = await SendAPIRequest(logger, req, res, url, "POST", data, authHeader);

        // If status is successful but contentType is not application/json
        if (status >= 200 && status < 300 && contentType !== "application/json") {
            req.log.warn("Response was not JSON, most likely invalid auth");
            res.status(400).json([]);
            return;
        }

        res.status(status).json(result);
    });


    return router;
}
