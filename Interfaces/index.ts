interface Instrument {
    installDate: string
    name: string
    expired: boolean
    serverParkName: string
    activeToday: boolean
    surveyDays: string[]
    link: string
    fieldPeriod: string
    surveyTLA: string
    dataRecordCount?: number
}

interface Survey {
    instruments: Instrument[]
    survey: string
}

export type {Instrument, Survey};
