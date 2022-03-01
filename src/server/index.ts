import { getConfigFromEnv } from "./config";
import { newServer } from "./server";

const config = getConfigFromEnv();
const app = newServer(config);

app.listen(config.Port);

console.log("App is listening on port " + config.Port);
