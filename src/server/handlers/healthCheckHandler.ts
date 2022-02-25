import express, { Request, Response, Router } from "express";

export default function HealthCheckHandler(): Router {
    const router = express.Router();

    router.get("/dqs-ui/:version/health", healthCheck);
    router.get("/_ah/start", start);
    router.get("/_ah/stop", stop);
    return router;
}

export async function healthCheck(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({ healthy: true });
}

export async function start(req: Request, res: Response): Promise<Response> {
    return res.status(200).json();
}

export async function stop(req: Request, res: Response): Promise<Response> {
    return res.status(200).json();
}
