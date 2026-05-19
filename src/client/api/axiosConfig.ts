import { type AxiosRequestConfig } from "axios";
import { AuthManager } from "blaise-login-react-client";

import { getSharedAuthOptions } from "../utils/auth";

const authManager = new AuthManager(getSharedAuthOptions());

export default function axiosConfig(): AxiosRequestConfig {
  return {
    headers: {
      "Content-Type": "application/json",
      ...authManager.authHeader(),
    },
  };
}
