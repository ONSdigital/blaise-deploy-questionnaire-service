// Generic function to make requests to the API
import { Request } from "express";
import axios, { Method } from "axios";
import * as PinoHttp from "pino-http";
type PromiseResponse = [number, any, string];

export async function SendAPIRequest(logger: PinoHttp.HttpLogger, req: Request, res: any, url: string, method: Method, data: any = null, headers: any = null): Promise<PromiseResponse> {
    logger(req, res);

    try {
        const response = await axios({
            url: url,
            method: method,
            data: data,
            headers,
            validateStatus: function (status) {
                return status >= 200;
            },
        });
        if (response.status >= 200 && response.status < 300) {
            req.log.info(`Status ${response.status} from ${method} ${url}`);
        } else if (response.status === 404) {
            req.log.info(`Status ${response.status} from ${method} ${url}`);
        } else {
            req.log.warn(`Status ${response.status} from ${method} ${url}`);
        }
        let contentType = "";
        if (response.headers && "content-type" in response.headers) {
            contentType = response.headers["content-type"];
        }
        return [response.status, response.data, contentType];
    } catch (error: any) {
        req.log.error(error, `${method} ${url} endpoint failed`);
        return [500, null, ""];
    }
}
