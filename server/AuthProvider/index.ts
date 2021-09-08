import jwt from "jsonwebtoken";
import getGoogleAuthToken from "./GoogleTokenProvider";

export default class AuthProvider {
    private readonly DDS_CLIENT_ID: string;
    private token: string;

    constructor(DDS_CLIENT_ID: string) {
        this.DDS_CLIENT_ID = DDS_CLIENT_ID;
        this.token = "";
    }

    private static hasTokenExpired(expireTimestamp: number): boolean {
        return expireTimestamp < Math.floor(new Date().getTime() / 1000);
    }

    async getAuthHeader(): Promise<{ Authorization: string }> {
        if (!this.isValidToken()) {
            this.token = await getGoogleAuthToken(this.DDS_CLIENT_ID);
        }
        return {Authorization: `Bearer ${this.token}`};
    }

    private isValidToken(): boolean {
        if (this.token === "") {
            return false;
        }
        const decodedToken = jwt.decode(this.token, {json: true});
        if (decodedToken === null) {
            console.log("Failed to decode token, Calling for new Google auth Token");
            return false;
        } else if (AuthProvider.hasTokenExpired(decodedToken["exp"] || 0)) {
            console.log("Auth Token Expired, Calling for new Google auth Token");

            return false;
        }

        return true;
    }
}
