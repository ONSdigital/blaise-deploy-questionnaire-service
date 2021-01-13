interface EnvironmentVariables {
    BLAISE_API_URL: string
    PROJECT_ID: string
    BUCKET_NAME: string
    SEVER_PARK: string
}

export function getEnvironmentVariables(): EnvironmentVariables {
    let {PROJECT_ID, BUCKET_NAME, BLAISE_API_URL, SEVER_PARK} = process.env;

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

    if (SEVER_PARK === undefined) {
        console.error("SEVER_PARK environment variable has not been set");
        SEVER_PARK = "ENV_VAR_NOT_SET";
    }
    return {BLAISE_API_URL, PROJECT_ID, BUCKET_NAME, SEVER_PARK};
}
