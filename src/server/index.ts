import { getConfigFromEnv } from "./config.js";
import createLogger from "./pinoLogger.js";
import { newServer } from "./server.js";

const config = getConfigFromEnv();
const httpLogger = createLogger();
const app = newServer(config, httpLogger);

app
  .listen(config.Port, () => {
    httpLogger.logger.info(`App is listening on port ${config.Port}`);
  })
  .on("error", (err: Error) => {
    httpLogger.logger.error(err, "Failed to start server");
    process.exit(1);
  });
