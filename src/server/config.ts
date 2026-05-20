import { type AuthConfig } from "blaise-login-react-server";

const DEFAULT_SESSION_TIMEOUT = "12h";
const ALLOWED_ROLES = ["DST", "BDSS", "Researcher", "IPS Researcher", "IPS Support"];

export interface Config extends AuthConfig {
  port: number;
  blaiseApiUrl: string;
  projectId: string;
  urlDomain: string;
  bucketName: string;
  serverPark: string;
  bimsApiUrl: string;
  bimsClientId: string;
  busApiUrl: string;
  busClientId: string;
  createDonorCasesCloudFunctionUrl: string;
  reissueNewDonorCaseCloudFunctionUrl: string;
  getUsersByRoleCloudFunctionUrl: string;
}

type RequiredConfigEnv = {
  BLAISE_API_URL: string | undefined;
  PROJECT_ID: string | undefined;
  URL_DOMAIN: string | undefined;
  BUCKET_NAME: string | undefined;
  SERVER_PARK: string | undefined;
  BIMS_API_URL: string | undefined;
  BIMS_CLIENT_ID: string | undefined;
  BUS_API_URL: string | undefined;
  BUS_CLIENT_ID: string | undefined;
  SESSION_SECRET: string | undefined;
  CREATE_DONOR_CASES_CLOUD_FUNCTION_URL: string | undefined;
  REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL: string | undefined;
  GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL: string | undefined;
};

type ResolvedRequiredConfigEnv = {
  [TKey in keyof RequiredConfigEnv]: string;
};

export function getConfigFromEnv(): Config {
  const {
    PROJECT_ID,
    URL_DOMAIN,
    BUCKET_NAME,
    BLAISE_API_URL,
    SERVER_PARK,
    BIMS_API_URL,
    BIMS_CLIENT_ID,
    BUS_API_URL,
    BUS_CLIENT_ID,
    PORT,
    SESSION_SECRET,
    CREATE_DONOR_CASES_CLOUD_FUNCTION_URL,
    REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL,
    GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL,
  } = process.env;

  const requiredEnv: RequiredConfigEnv = {
    BLAISE_API_URL,
    PROJECT_ID,
    URL_DOMAIN,
    BUCKET_NAME,
    SERVER_PARK,
    BIMS_API_URL,
    BIMS_CLIENT_ID,
    BUS_API_URL,
    BUS_CLIENT_ID,
    SESSION_SECRET,
    CREATE_DONOR_CASES_CLOUD_FUNCTION_URL,
    REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL,
    GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL,
  };

  assertResolvedRequiredEnv(requiredEnv);

  return {
    port: parsePort(PORT),
    blaiseApiUrl: fixUrl(requiredEnv.BLAISE_API_URL),
    projectId: requiredEnv.PROJECT_ID,
    urlDomain: requiredEnv.URL_DOMAIN,
    bucketName: requiredEnv.BUCKET_NAME,
    serverPark: requiredEnv.SERVER_PARK,
    bimsApiUrl: requiredEnv.BIMS_API_URL,
    bimsClientId: requiredEnv.BIMS_CLIENT_ID,
    busApiUrl: requiredEnv.BUS_API_URL,
    busClientId: requiredEnv.BUS_CLIENT_ID,
    SessionTimeout: DEFAULT_SESSION_TIMEOUT,
    SessionSecret: requiredEnv.SESSION_SECRET,
    TokenIssuer: requiredEnv.PROJECT_ID,
    Roles: ALLOWED_ROLES,
    createDonorCasesCloudFunctionUrl: requiredEnv.CREATE_DONOR_CASES_CLOUD_FUNCTION_URL,
    reissueNewDonorCaseCloudFunctionUrl: requiredEnv.REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL,
    getUsersByRoleCloudFunctionUrl: requiredEnv.GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL,
  };
}

function fixUrl(url: string): string {
  if (url.startsWith("http")) {
    return url;
  }

  return `http://${url}`;
}

function assertResolvedRequiredEnv(
  env: RequiredConfigEnv,
): asserts env is ResolvedRequiredConfigEnv {
  const requiredEnvErrors = Object.entries(env)
    .map(([name, value]) => {
      if (value === undefined || value.trim() === "" || value === `_${name}`) {
        return name;
      }

      return undefined;
    })
    .filter((errorMessage): errorMessage is string => errorMessage !== undefined);

  if (requiredEnvErrors.length > 0) {
    throw new Error(`Missing required environment variables: ${requiredEnvErrors.join(", ")}`);
  }
}

function parsePort(port: string | undefined): number {
  if (port === undefined) {
    return 5000;
  }

  const parsed = Number(port);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid PORT value: ${port}`);
  }

  return parsed;
}
