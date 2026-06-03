import { Logging } from "@google-cloud/logging";
import { type Logger } from "pino";

interface AuditLog {
  id: string;
  timestamp: string;
  message: string;
  severity: string;
}

const AUDIT_LOG_LOOKBACK_DAYS = 7;

export default class AuditLogger {
  private readonly projectId: string;
  private readonly logger: Logging;
  private readonly logName: string;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.logger = new Logging({ projectId: this.projectId });
    this.logName = `projects/${this.projectId}/logs/stdout`;
  }

  info(logger: Logger, message: string): void {
    logger.info(`AUDIT_LOG: ${message}`);
  }

  error(logger: Logger, message: string): void {
    logger.error(`AUDIT_LOG: ${message}`);
  }

  async getLogs(): Promise<AuditLog[]> {
    const auditLogs: AuditLog[] = [];
    const log = this.logger.log(this.logName);
    const filter = buildAuditLogFilter(new Date());
    const [entries] = await log.getEntries({ filter: filter, maxResults: 50 });

    for (const entry of entries) {
      let id = "";
      let timestamp = "";
      let severity = "INFO";
      let message = "";

      if (entry.metadata.insertId != null) {
        id = entry.metadata.insertId;
      }

      if (entry.metadata.timestamp != null) {
        timestamp = entry.metadata.timestamp.toString();
      }

      if (entry.metadata.severity != null) {
        severity = entry.metadata.severity.toString();
      }

      if (entry.data?.message != null && typeof entry.data.message === "string") {
        message = entry.data.message.replace(/^AUDIT_LOG: /, "");
      }

      auditLogs.push({
        id: id,
        timestamp: timestamp,
        message: message,
        severity: severity,
      });
    }

    return auditLogs;
  }
}

function buildAuditLogFilter(referenceDate: Date): string {
  const earliestTimestamp = new Date(
    referenceDate.getTime() - AUDIT_LOG_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  return (
    'resource.type="gae_app" AND ' +
    'resource.labels.module_id="dqs-ui" AND ' +
    `timestamp >= "${earliestTimestamp}" AND ` +
    'jsonPayload.message:"AUDIT_LOG:"'
  );
}
