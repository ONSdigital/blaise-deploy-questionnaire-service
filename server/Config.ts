export interface EnvironmentVariables {
    BLAISE_API_URL: string;
    PROJECT_ID: string;
    BUCKET_NAME: string;
    SERVER_PARK: string;
    BIMS_API_URL: string;
    BIMS_CLIENT_ID: string;
    BUS_API_URL: string;
    BUS_CLIENT_ID: string;
}

export function getEnvironmentVariables(): EnvironmentVariables {
    let {
        PROJECT_ID,
        BUCKET_NAME,
        BLAISE_API_URL,
        SERVER_PARK,
        BIMS_API_URL,
        BIMS_CLIENT_ID,
        BUS_API_URL,
        BUS_CLIENT_ID
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
    return {
        BLAISE_API_URL,
        PROJECT_ID,
        BUCKET_NAME,
        SERVER_PARK,
        BIMS_API_URL,
        BIMS_CLIENT_ID,
        BUS_API_URL,
        BUS_CLIENT_ID
    };
}
