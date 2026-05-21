import express, { type NextFunction, type Request, type Response } from "express";

class MockAuth {
  constructor(_config?: unknown) {}

  public validateToken(): boolean {
    return true;
  }

  public middleware = (_req: Request, res: Response, next: NextFunction): void => {
    if (!this.validateToken()) {
      res.status(401).json({ message: "Unauthorized" });

      return;
    }

    next();
  };

  public getUser(): { name: string } {
    return { name: "rich" };
  }

  public getToken(): string {
    return "example-token";
  }
}

export function mockLoginReactServerModule() {
  return {
    Auth: MockAuth,
    newLoginHandler: () => {
      const router = express.Router();

      router.use((_req: Request, _res: Response, next: NextFunction) => next());

      return router;
    },
  };
}
