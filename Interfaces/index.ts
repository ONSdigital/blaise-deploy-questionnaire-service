interface Instrument {
    installDate: string
    name: string
    expired?: boolean
    serverParkName: string
    activeToday?: boolean
    surveyDays?: string[]
    link?: string
    fieldPeriod: string
    surveyTLA?: string
    dataRecordCount?: number
    status?: string
    hasData?: boolean
    active?: boolean
}

interface Survey {
    instruments: Instrument[]
    survey: string
}

interface AuditLog {
    id: string
    timestamp: string
    message: string
    severity: string
}

export type {Instrument, Survey, AuditLog};
