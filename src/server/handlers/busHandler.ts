import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

export interface BusClientLike {
  generateUacsForQuestionnaire(instrumentName: string): Promise<unknown>;
  getUacsByCaseId(instrumentName: string): Promise<unknown>;
  getUacCount(instrumentName: string): Promise<{ count: number }>;
}

export default function NewBusHandler(busApiClient: BusClientLike, auth: Auth): Router {
  const router = express.Router();

  const busHandler = new BusHandler(busApiClient);

  router.post("/api/uacs/instrument/:instrumentName", auth.Middleware, busHandler.GenerateUacs);
  router.get(
    "/api/uacs/instrument/:instrumentName/bycaseid",
    auth.Middleware,
    busHandler.GetUacsByCaseId,
  );
  router.get("/api/uacs/instrument/:instrumentName/count", auth.Middleware, busHandler.GetUacCount);

  return router;
}

class BusHandler {
  busApiClient: BusClientLike;

  constructor(busApiClient: BusClientLike) {
    this.busApiClient = busApiClient;

    this.GenerateUacs = this.GenerateUacs.bind(this);
    this.GetUacsByCaseId = this.GetUacsByCaseId.bind(this);
    this.GetUacCount = this.GetUacCount.bind(this);
  }

  async GenerateUacs(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params as { instrumentName: string };
    const uacs = await this.busApiClient.generateUacsForQuestionnaire(instrumentName);

    if (typeof uacs !== "object") {
      req.log.error(`Generate UACs for ${instrumentName} response is not an object`);

      return res.status(500).json();
    }

    req.log.info(`Generate UACs for ${instrumentName} response successful`);

    return res.status(200).json(uacs);
  }

  async GetUacsByCaseId(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params as { instrumentName: string };
    const uacs = await this.busApiClient.getUacsByCaseId(instrumentName);

    if (typeof uacs !== "object") {
      req.log.error(`Get UACs by case ID for ${instrumentName} response is not an object`);

      return res.status(500).json();
    }

    req.log.info(`Get UACs by case ID for ${instrumentName} response successful`);

    return res.status(200).json(uacs);
  }

  async GetUacCount(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params as { instrumentName: string };
    const uacCount = await this.busApiClient.getUacCount(instrumentName);

    if (typeof uacCount.count !== "number") {
      req.log.error(`Get UAC code for ${instrumentName} response is not a number`);

      return res.status(500).json();
    }

    req.log.info(
      `Get UAC code count for ${instrumentName} response successful, count: ${uacCount.count}`,
    );

    return res.status(200).json(uacCount);
  }
}
