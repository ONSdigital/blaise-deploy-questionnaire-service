interface AuditLog {
    id: string;
    timestamp: string;
    message: string;
    severity: string;
}

export type { AuditLog };
