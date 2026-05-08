import { getConfigFromEnv } from "./config.js";
import { newServer } from "./server.js";

const config = getConfigFromEnv();
const app = newServer(config);

app.listen(config.Port);

console.log("App is listening on port " + config.Port);
