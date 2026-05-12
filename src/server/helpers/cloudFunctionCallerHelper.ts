import axios from "axios";
import { GoogleAuth } from "google-auth-library";

async function getIdTokenFromMetadataServer(targetAudience: string): Promise<string> {
  const googleAuth = new GoogleAuth();
  const client = await googleAuth.getIdTokenClient(targetAudience);

  return client.idTokenProvider.fetchIdToken(targetAudience);
}

export async function callCloudFunction(
  url: string,
  payload: unknown,
): Promise<{ message: string; status: number }> {
  const token = await getIdTokenFromMetadataServer(url);

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
}
