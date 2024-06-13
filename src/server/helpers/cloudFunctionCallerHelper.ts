import axios from "axios";
import { GoogleAuth } from "google-auth-library";

export async function getIdTokenFromMetadataServer(targetAudience: string) {
    const googleAuth = new GoogleAuth();

    const client = await googleAuth.getIdTokenClient(targetAudience);

    // Get the ID token.
    // Once you've obtained the ID token, you can use it to make an authenticated call
    // to the target audience.
    const token = await client.idTokenProvider.fetchIdToken(targetAudience);
    return token;
}

export async function callCloudFunctionToCreateDonorCases(url: string, payload: any): Promise<{ message: string, status: number }> {

    const token = await getIdTokenFromMetadataServer(url);

    try {
        const res = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        return {
            message: res.data,
            status: res.status
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            message: "Error invoking cloud function",
            status: 500
        };
    }

}