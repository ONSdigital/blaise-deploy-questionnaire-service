import axios from "axios";
import { GoogleAuth } from "google-auth-library";

export async function callCloudFunctionToCreateDonorCases(url: string, payload: any): Promise<string> {

    async function getIdTokenFromMetadataServer(targetAudience: string) {
        const googleAuth = new GoogleAuth();

        const client = await googleAuth.getIdTokenClient(targetAudience);

        // Get the ID token.
        // Once you've obtained the ID token, you can use it to make an authenticated call
        // to the target audience.
        const token = await client.idTokenProvider.fetchIdToken(targetAudience);
        return token;
    }
    const token = getIdTokenFromMetadataServer(url);
    try {
        const response = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Response:", (await response).data);
        return "success";
    } catch (error) {
        console.error("Error:", error);
        return "error"
    }





}