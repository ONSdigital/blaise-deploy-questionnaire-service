import type { Questionnaire } from "blaise-api-node-client";

type LocationStateRecord = Record<string, unknown>;

function isLocationStateRecord(value: unknown): value is LocationStateRecord {
  return typeof value === "object" && value !== null;
}

function isQuestionnaire(value: unknown): value is Questionnaire {
  // Changed: validate router state explicitly before treating it as application data.
  return (
    isLocationStateRecord(value) &&
    typeof value.name === "string" &&
    (typeof value.installDate === "string" || value.installDate === undefined) &&
    (typeof value.serverParkName === "string" || value.serverParkName === undefined) &&
    (typeof value.dataRecordCount === "number" || value.dataRecordCount === undefined) &&
    (typeof value.fieldPeriod === "string" || value.fieldPeriod === undefined) &&
    (typeof value.status === "string" || value.status === undefined)
  );
}

export function readStateString(state: unknown, key: string): string | undefined {
  if (!isLocationStateRecord(state)) {
    return undefined;
  }

  return typeof state[key] === "string" ? state[key] : undefined;
}

export function readNullableStateString(state: unknown, key: string): string | null | undefined {
  if (!isLocationStateRecord(state)) {
    return undefined;
  }

  const value = state[key];

  return typeof value === "string" || value === null ? value : undefined;
}

export function readStateNumber(state: unknown, key: string): number | undefined {
  if (!isLocationStateRecord(state)) {
    return undefined;
  }

  return typeof state[key] === "number" ? state[key] : undefined;
}

export function readStateStringArray(state: unknown, key: string): string[] | undefined {
  if (!isLocationStateRecord(state)) {
    return undefined;
  }

  const value = state[key];

  return Array.isArray(value) && value.every((item): item is string => typeof item === "string")
    ? value
    : undefined;
}

export function readStateQuestionnaire(state: unknown, key: string): Questionnaire | undefined {
  if (!isLocationStateRecord(state)) {
    return undefined;
  }

  return isQuestionnaire(state[key]) ? state[key] : undefined;
}
