import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import { sanitise } from "../helpers/sanitise.js";

export interface BusClientLike {
  generateUacsForQuestionnaire(instrumentName: string): Promise<unknown>;
  getUacsByCaseId(instrumentName: string): Promise<unknown>;
  getUacCount(instrumentName: string): Promise<{ count: number }>;
}

export default function newBusHandler(busApiClient: BusClientLike, auth: Auth): Router {
  const router = express.Router();

  const busHandler = new BusHandler(busApiClient);

  router.post("/api/uacs/instrument/:instrumentName", auth.Middleware, busHandler.generateUacs);
  router.get(
    "/api/uacs/instrument/:instrumentName/bycaseid",
    auth.Middleware,
    busHandler.getUacsByCaseId,
  );
  router.get("/api/uacs/instrument/:instrumentName/count", auth.Middleware, busHandler.getUacCount);

  return router;
}

class BusHandler {
  busApiClient: BusClientLike;

  constructor(busApiClient: BusClientLike) {
    this.busApiClient = busApiClient;
  }

  generateUacs = async (req: Request, res: Response): Promise<Response> => {
    const { instrumentName } = req.params as { instrumentName: string };
    const safeInstrumentName = sanitise(instrumentName);
    const uacs = await this.busApiClient.generateUacsForQuestionnaire(instrumentName);

    if (typeof uacs !== "object") {
      req.log.error(`Generate Uacs for ${safeInstrumentName} response is not an object`);

      return res.status(500).json();
    }

    req.log.info(`Generate Uacs for ${safeInstrumentName} response successful`);

    return res.status(200).json(uacs);
  };

  getUacsByCaseId = async (req: Request, res: Response): Promise<Response> => {
    const { instrumentName } = req.params as { instrumentName: string };
    const safeInstrumentName = sanitise(instrumentName);
    const uacs = await this.busApiClient.getUacsByCaseId(instrumentName);

    if (typeof uacs !== "object") {
      req.log.error(`Get Uacs by case ID for ${safeInstrumentName} response is not an object`);

      return res.status(500).json();
    }

    req.log.info(`Get Uacs by case ID for ${safeInstrumentName} response successful`);

    return res.status(200).json(uacs);
  };

  getUacCount = async (req: Request, res: Response): Promise<Response> => {
    const { instrumentName } = req.params as { instrumentName: string };
    const safeInstrumentName = sanitise(instrumentName);
    const uacCount = await this.busApiClient.getUacCount(instrumentName);

    if (typeof uacCount.count !== "number") {
      req.log.error(`Get Uac for ${safeInstrumentName} response is not a number`);

      return res.status(500).json();
    }

    req.log.info(
      `Get Uac count for ${safeInstrumentName} response successful, count: ${uacCount.count}`,
    );

    return res.status(200).json(uacCount);
  };
}
