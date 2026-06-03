import { clientLogger } from "../utils/logger";

type LogArg = string | number | boolean | null | undefined;

function formatLogArg(value: LogArg): string {
  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  return String(value);
}

export function formatFunctionCall(functionName: string, ...args: LogArg[]): string {
  return `${functionName}(${args.map(formatLogArg).join(", ")})`;
}

export function logFunctionCall(functionName: string, ...args: LogArg[]): void {
  clientLogger.info(`Call to ${formatFunctionCall(functionName, ...args)}`);
}

export function logFunctionError(functionName: string, error: unknown, ...args: LogArg[]): void {
  clientLogger.error(`${formatFunctionCall(functionName, ...args)} failed: ${error}`);
}
