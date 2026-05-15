import crypto from "crypto";

import { type AuthConfig } from "blaise-login-react-server";

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
  CreateDonorCasesCloudFunctionUrl: string;
  ReissueNewDonorCaseCloudFunctionUrl: string;
  GetUsersByRoleCloudFunctionUrl: string;
}

export function getConfigFromEnv(): Config {
  const {
    PROJECT_ID,
    BUCKET_NAME,
    BLAISE_API_URL,
    SERVER_PARK,
    BIMS_API_URL,
    BIMS_CLIENT_ID,
    BUS_API_URL,
    BUS_CLIENT_ID,
    PORT,
    SESSION_TIMEOUT,
    SESSION_SECRET,
    ROLES,
    CREATE_DONOR_CASES_CLOUD_FUNCTION_URL,
    REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL,
    GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL,
  } = process.env;

  const requiredEnvErrors = [
    requireEnv("BLAISE_API_URL", BLAISE_API_URL),
    requireEnv("PROJECT_ID", PROJECT_ID),
    requireEnv("BUCKET_NAME", BUCKET_NAME),
    requireEnv("SERVER_PARK", SERVER_PARK),
    requireEnv("BIMS_API_URL", BIMS_API_URL),
    requireEnv("BIMS_CLIENT_ID", BIMS_CLIENT_ID),
    requireEnv("BUS_API_URL", BUS_API_URL),
    requireEnv("BUS_CLIENT_ID", BUS_CLIENT_ID),
    requireEnv("CREATE_DONOR_CASES_CLOUD_FUNCTION_URL", CREATE_DONOR_CASES_CLOUD_FUNCTION_URL),
    requireEnv(
      "REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL",
      REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL,
    ),
    requireEnv("GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL", GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL),
  ].filter((errorMessage): errorMessage is string => errorMessage !== undefined);

  if (requiredEnvErrors.length > 0) {
    throw new Error(`Missing required environment variables: ${requiredEnvErrors.join(", ")}`);
  }

  const requiredEnv = {
    BLAISE_API_URL: BLAISE_API_URL as string,
    PROJECT_ID: PROJECT_ID as string,
    BUCKET_NAME: BUCKET_NAME as string,
    SERVER_PARK: SERVER_PARK as string,
    BIMS_API_URL: BIMS_API_URL as string,
    BIMS_CLIENT_ID: BIMS_CLIENT_ID as string,
    BUS_API_URL: BUS_API_URL as string,
    BUS_CLIENT_ID: BUS_CLIENT_ID as string,
    CREATE_DONOR_CASES_CLOUD_FUNCTION_URL: CREATE_DONOR_CASES_CLOUD_FUNCTION_URL as string,
    REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL: REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL as string,
    GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL: GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL as string,
  };

  const port = parsePort(PORT);
  const timeout = loadSessionTimeout(SESSION_TIMEOUT);

  return {
    Port: port,
    BlaiseApiUrl: fixUrl(requiredEnv.BLAISE_API_URL),
    ProjectId: requiredEnv.PROJECT_ID,
    BucketName: requiredEnv.BUCKET_NAME,
    ServerPark: requiredEnv.SERVER_PARK,
    BimsApiUrl: requiredEnv.BIMS_API_URL,
    BimsClientId: requiredEnv.BIMS_CLIENT_ID,
    BusApiUrl: requiredEnv.BUS_API_URL,
    BusClientId: requiredEnv.BUS_CLIENT_ID,
    SessionTimeout: timeout,
    SessionSecret: sessionSecret(SESSION_SECRET),
    Roles: loadRoles(ROLES),
    CreateDonorCasesCloudFunctionUrl: requiredEnv.CREATE_DONOR_CASES_CLOUD_FUNCTION_URL,
    ReissueNewDonorCaseCloudFunctionUrl: requiredEnv.REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL,
    GetUsersByRoleCloudFunctionUrl: requiredEnv.GET_USERS_BY_ROLE_CLOUD_FUNCTION_URL,
  };
}

function fixUrl(url: string): string {
  if (url.startsWith("http")) {
    return url;
  }

  if (url.startsWith("localhost") || url.startsWith("127.0.0.1")) {
    return `http://${url}`;
  }

  return `https://${url}`;
}

function requireEnv(name: string, value: string | undefined): string | undefined {
  if (!value || value.trim() === "") {
    return name;
  }

  return undefined;
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

function loadSessionTimeout(sessionTimeout: string | undefined): string {
  if (sessionTimeout === undefined || sessionTimeout === "_SESSION_TIMEOUT") {
    return "12h";
  }

  return sessionTimeout;
}

function loadRoles(roles: string | undefined): string[] {
  if (!roles || roles === "" || roles === "_ROLES") {
    return ["DST", "BDSS", "Researcher", "IPS Researcher", "IPS Support"];
  }

  return roles.split(",");
}

function sessionSecret(secret: string | undefined): string {
  if (!secret || secret === "" || secret === "_SESSION_SECRET") {
    return crypto.randomBytes(20).toString("hex");
  }

  return secret;
}
