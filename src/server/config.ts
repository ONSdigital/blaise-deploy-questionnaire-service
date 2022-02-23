import crypto from "crypto";
import { AuthConfig } from "blaise-login-react-server";

export interface Config extends AuthConfig {
    Port: number;
    BlaiseApiUrl: string;
    ProjectId: string;
    BucketName: string;
    ServerPark: string;
    BimsApiUrl: string;
    BimsClientId: string;
    BusApiUrl: string;
    BusClientId: string;
}

export function getConfigFromEnv(): Config {
    let {
        PORT,
        PROJECT_ID,
        BUCKET_NAME,
        BLAISE_API_URL,
        SERVER_PARK,
        BIMS_API_URL,
        BIMS_CLIENT_ID,
        BUS_API_URL,
        BUS_CLIENT_ID,
        SESSION_TIMEOUT,
    } = process.env;

    const {
        SESSION_SECRET,
        ROLES
    } = process.env;

    if (BLAISE_API_URL === undefined) {
        console.error("BLAISE_API_URL environment variable has not been set");
        BLAISE_API_URL = "ENV_VAR_NOT_SET";
    }

    if (PROJECT_ID === undefined) {
        console.error("PROJECT_ID environment variable has not been set");
        PROJECT_ID = "ENV_VAR_NOT_SET";
    }

    if (BUCKET_NAME === undefined) {
        console.error("BUCKET_NAME environment variable has not been set");
        BUCKET_NAME = "ENV_VAR_NOT_SET";
    }

    if (SERVER_PARK === undefined) {
        console.error("SERVER_PARK environment variable has not been set");
        SERVER_PARK = "ENV_VAR_NOT_SET";
    }

    if (BIMS_API_URL === undefined) {
        console.error("SERVER_PARK environment variable has not been set");
        BIMS_API_URL = "ENV_VAR_NOT_SET";
    }

    if (BIMS_CLIENT_ID === undefined) {
        console.error("SERVER_PARK environment variable has not been set");
        BIMS_CLIENT_ID = "ENV_VAR_NOT_SET";
    }

    if (BUS_API_URL === undefined) {
        console.error("BUS_API_URL environment variable has not been set");
        BUS_API_URL = "ENV_VAR_NOT_SET";
    }

    if (BUS_CLIENT_ID === undefined) {
        console.error("BUS_CLIENT_ID environment variable has not been set");
        BUS_CLIENT_ID = "ENV_VAR_NOT_SET";
    }

    if (SESSION_TIMEOUT === undefined || SESSION_TIMEOUT === "_SESSION_TIMEOUT") {
        console.error("SESSION_TIMEOUT environment variable has not been set");
        SESSION_TIMEOUT = "12h";
    }

    let port = 5000;
    if (PORT !== undefined) {
        port = +PORT;
    }

    return {
        Port: port,
        BlaiseApiUrl: fixURL(BLAISE_API_URL),
        ProjectId: PROJECT_ID,
        BucketName: BUCKET_NAME,
        ServerPark: SERVER_PARK,
        BimsApiUrl: BIMS_API_URL,
        BimsClientId: BIMS_CLIENT_ID,
        BusApiUrl: BUS_API_URL,
        BusClientId: BUS_CLIENT_ID,
        SessionTimeout: SESSION_TIMEOUT,
        SessionSecret: sessionSecret(SESSION_SECRET),
        Roles: loadRoles(ROLES)
    };
}

function fixURL(url: string): string {
    if (url.startsWith("http")) {
        return url;
    }
    return `http://${url}`;
}

function loadRoles(roles: string | undefined): string[] {
    if (!roles || roles === "" || roles === "_ROLES") {
        return ["DST", "BDSS", "Researcher"];
    }
    return roles.split(",");
}

function sessionSecret(secret: string | undefined): string {
    if (!secret || secret === "" || secret === "_SESSION_SECRET") {
        return crypto.randomBytes(20).toString("hex");
    }
    return secret;
}
