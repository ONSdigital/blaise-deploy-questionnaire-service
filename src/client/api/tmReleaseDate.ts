import { createDateClient } from "./dateClient";

function parseTmReleaseDateResponse(data: unknown): string {
  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object" && "tmreleasedate" in (data as Record<string, unknown>)) {
    const value = (data as Record<string, unknown>).tmreleasedate;

    return typeof value === "string" ? value : "";
  }

  return "";
}

const tmReleaseDateClient = createDateClient({
  apiPath: "tmreleasedate",
  fieldKey: "tmreleasedate",
  logLabel: "TmReleaseDate",
  parseResponseData: parseTmReleaseDateResponse,
});

export const setTmReleaseDate = tmReleaseDateClient.set;

export const getTmReleaseDate = tmReleaseDateClient.get;

export const deleteTmReleaseDate = tmReleaseDateClient.delete;
