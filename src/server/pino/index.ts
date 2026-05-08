import { type HttpLogger, pinoHttp } from "pino-http";

// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
// ADDED: Type definition to allow safe string indexing
const PinoLevelToSeverityLookup: Record<string, string> = {
  trace: "DEBUG",
  debug: "DEBUG",
  info: "INFO",
  warn: "WARNING",
  error: "ERROR",
  fatal: "CRITICAL",
};

const defaultPinoConf = {
  messageKey: "message",
  formatters: {
    level(label: string, number: number) {
      // CHANGED: Typed as string and number to remove unknown/ts-ignore
      return {
        severity: PinoLevelToSeverityLookup[label] || PinoLevelToSeverityLookup["info"],
        level: number,
      };
    },
    log(info: never) {
      return { info };
    },
  },
  serializers: {
    req: (req: { method: string; url: string; raw: { user: unknown } }) => ({
      method: req.method,
      url: req.url,
      user: req.raw.user,
    }),
  },
};

export default function createLogger(options: unknown = { autoLogging: false }): HttpLogger {
  let pinoConfig = {};

  if (process.env.NODE_ENV === "production") {
    pinoConfig = defaultPinoConf;
  }

  // CHANGED: Use the named export 'pinoHttp' instead of the default module namespace
  return pinoHttp(Object.assign({}, options, pinoConfig));
}
