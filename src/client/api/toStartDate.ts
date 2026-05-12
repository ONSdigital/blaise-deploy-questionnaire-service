import { createDateClient } from "./dateClient";

const toStartDateClient = createDateClient({
  apiPath: "tostartdate",
  fieldKey: "tostartdate",
  notFoundStatuses: [404],
});

export const setToStartDate = toStartDateClient.set;

export const getToStartDate = toStartDateClient.get;

export const deleteToStartDate = toStartDateClient.delete;
