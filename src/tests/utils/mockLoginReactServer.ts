import express, { type NextFunction, type Request, type Response } from "express";

class MockAuth {
  constructor(_config?: unknown) {
    // Intentionally empty for test use.
  }

  public ValidateToken(): boolean {
    return true;
  }

  public Middleware(_req: Request, _res: Response, next: NextFunction): void {
    next();
  }

  public GetUser(): { name: string } {
    return { name: "rich" };
  }

  public GetToken(): string {
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
