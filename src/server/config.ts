import { type AuthConfig } from "blaise-login-react-server";

const DEFAULT_SESSION_TIMEOUT = "12h";
const ALLOWED_ROLES = ["DST", "BDSS", "Researcher", "IPS Researcher", "IPS Support"];

export interface Config extends AuthConfig {
  Port: number;
  ProjectId: string;
  UrlDomain: string;
  BucketName: string;
  ServerPark: string;
  BimsApiUrl: string;
  BimsClientId: string;
  BusApiUrl: string;
  BusClientId: string;
  CreateDonorCasesCloudFunctionUrl: string;
  ReissueNewDonorCaseCloudFunctionUrl: string;
  GetUsersByRoleCloudFunctionUrl: string;
}

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

  const requiredEnvErrors = [
    requireResolvedEnv("BLAISE_API_URL", BLAISE_API_URL),
    requireResolvedEnv("PROJECT_ID", PROJECT_ID),
    requireResolvedEnv("URL_DOMAIN", URL_DOMAIN),
    requireResolvedEnv("BUCKET_NAME", BUCKET_NAME),
    requireResolvedEnv("SERVER_PARK", SERVER_PARK),
    requireResolvedEnv("BIMS_API_URL", BIMS_API_URL),
    requireResolvedEnv("BIMS_CLIENT_ID", BIMS_CLIENT_ID),
    requireResolvedEnv("BUS_API_URL", BUS_API_URL),
    requireResolvedEnv("BUS_CLIENT_ID", BUS_CLIENT_ID),
    requireResolvedEnv("SESSION_SECRET", SESSION_SECRET),
    requireResolvedEnv(
      "CREATE_DONOR_CASES_CLOUD_FUNCTION_URL",
      CREATE_DONOR_CASES_CLOUD_FUNCTION_URL,
    ),
    requireResolvedEnv(
      "REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL",
      REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL,
    ),
    requireResolvedEnv(
      "GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL",
      GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL,
    ),
  ].filter((errorMessage): errorMessage is string => errorMessage !== undefined);

  if (requiredEnvErrors.length > 0) {
    throw new Error(`Missing required environment variables: ${requiredEnvErrors.join(", ")}`);
  }

  return {
    Port: parsePort(PORT),
    BlaiseApiUrl: fixUrl(getRequiredEnv("BLAISE_API_URL", BLAISE_API_URL)),
    ProjectId: getRequiredEnv("PROJECT_ID", PROJECT_ID),
    UrlDomain: getRequiredEnv("URL_DOMAIN", URL_DOMAIN),
    BucketName: getRequiredEnv("BUCKET_NAME", BUCKET_NAME),
    ServerPark: getRequiredEnv("SERVER_PARK", SERVER_PARK),
    BimsApiUrl: getRequiredEnv("BIMS_API_URL", BIMS_API_URL),
    BimsClientId: getRequiredEnv("BIMS_CLIENT_ID", BIMS_CLIENT_ID),
    BusApiUrl: getRequiredEnv("BUS_API_URL", BUS_API_URL),
    BusClientId: getRequiredEnv("BUS_CLIENT_ID", BUS_CLIENT_ID),
    SessionTimeout: DEFAULT_SESSION_TIMEOUT,
    SessionSecret: getRequiredEnv("SESSION_SECRET", SESSION_SECRET),
    TokenIssuer: getRequiredEnv("PROJECT_ID", PROJECT_ID),
    Roles: ALLOWED_ROLES,
    CreateDonorCasesCloudFunctionUrl: getRequiredEnv(
      "CREATE_DONOR_CASES_CLOUD_FUNCTION_URL",
      CREATE_DONOR_CASES_CLOUD_FUNCTION_URL,
    ),
    ReissueNewDonorCaseCloudFunctionUrl: getRequiredEnv(
      "REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL",
      REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL,
    ),
    GetUsersByRoleCloudFunctionUrl: getRequiredEnv(
      "GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL",
      GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL,
    ),
  };
}

function fixUrl(url: string): string {
  if (url.startsWith("http")) {
    return url;
  }

  return `http://${url}`;
}

function requireResolvedEnv(name: string, value: string | undefined): string | undefined {
  if (!value || value.trim() === "" || value === `_${name}`) {
    return name;
  }

  return undefined;
}

function getRequiredEnv(name: string, value: string | undefined): string {
  const missingEnv = requireResolvedEnv(name, value);

  if (missingEnv) {
    throw new Error(`Missing required environment variable: ${missingEnv}`);
  }

  return value;
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
