import { type HttpLogger, pinoHttp } from "pino-http";

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

  return pinoHttp(Object.assign({}, options, pinoConfig));
}
