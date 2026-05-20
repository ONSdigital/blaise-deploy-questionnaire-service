import express, { type Request, type Response, type Router } from "express";

export default function newHealthCheckHandler(): Router {
  const router = express.Router();

  router.get("/dqs-ui/:version/health", healthCheck);
  router.get("/_ah/start", start);
  router.get("/_ah/stop", stop);

  return router;
}

async function healthCheck(req: Request, res: Response): Promise<Response> {
  return res.status(200).json({ healthy: true });
}

async function start(req: Request, res: Response): Promise<Response> {
  return res.status(200).json();
}

async function stop(req: Request, res: Response): Promise<Response> {
  return res.status(200).json();
}
