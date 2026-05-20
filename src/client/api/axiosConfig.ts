import axios, { type AxiosRequestConfig } from "axios";
import { AuthManager } from "blaise-login-react-client";

import { getSharedAuthOptions } from "../utils/auth";

export const AUTH_EXPIRED_EVENT_NAME = "dqs-auth-expired";

const authManager = new AuthManager(getSharedAuthOptions());
let authExpiryInterceptorRegistered = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getResponseStatus(error: unknown): number | undefined {
  /* v8 ignore next 3 */
  if (!isRecord(error)) {
    return undefined;
  }

  const { response } = error;

  return isRecord(response) && typeof response.status === "number" ? response.status : undefined;
}

function notifyAuthExpired(): void {
  authManager.clearToken();

  /* v8 ignore next 3 */
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT_NAME));
  }
}

function ensureAuthExpiryInterceptor(): void {
  /* v8 ignore next 3 */
  if (authExpiryInterceptorRegistered) {
    return;
  }

  axios.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      const status = getResponseStatus(error);

      if ((status === 401 || status === 403) && authManager.getToken() != null) {
        notifyAuthExpired();
      }

      throw error;
    },
  );

  authExpiryInterceptorRegistered = true;
}

ensureAuthExpiryInterceptor();

export function hasAuthToken(): boolean {
  return authManager.getToken() != null;
}

export default function axiosConfig(): AxiosRequestConfig {
  return {
    headers: {
      "Content-Type": "application/json",
      ...authManager.authHeader(),
    },
  };
}
