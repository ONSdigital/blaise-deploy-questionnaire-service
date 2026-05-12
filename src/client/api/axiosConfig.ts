import { type AxiosRequestConfig } from "axios";
import { AuthManager } from "blaise-login-react-client";

const authManager = new AuthManager();

export default function axiosConfig(): AxiosRequestConfig {
  return {
    headers: {
      "Content-Type": "application/json",
      ...authManager.authHeader(),
    },
  };
}
