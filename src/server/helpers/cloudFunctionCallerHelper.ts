import axios from "axios";
import { GoogleAuth } from "google-auth-library";

async function getIdTokenFromMetadataServer(targetAudience: string) {
  const googleAuth = new GoogleAuth();

  const client = await googleAuth.getIdTokenClient(targetAudience);

  return await client.idTokenProvider.fetchIdToken(targetAudience);
}

export async function callCloudFunction(
  url: string,
  payload: unknown,
): Promise<{ message: string; status: number }> {
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
      status: res.status,
    };
  } catch (error) {
    console.error("Error:", error);

    const cloudFunctionError = error as { response?: { data?: string } };

    return {
      message: cloudFunctionError.response?.data || "",
      status: 500,
    };
  }
}
