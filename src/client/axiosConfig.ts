import { AxiosRequestConfig } from "axios";
import { AuthManager } from "blaise-login-react/blaise-login-react-client";

export default function axiosConfig(): AxiosRequestConfig {
    const authManager = new AuthManager();
    return {
        headers: {
            "Content-Type": "application/json",
            ...authManager.authHeader()
        }
    };
}
