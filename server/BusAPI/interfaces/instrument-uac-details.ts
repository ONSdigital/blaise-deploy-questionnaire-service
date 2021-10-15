interface InstrumentUacDetails {
    [case_id: string]: Uac;
}

interface Uac {
    instrument_name: string,
    postcode_attempts: number,
    postcode_attempt_timestamp: string,
    uac_chunks: UacChunks
}

interface UacChunks {
    uac1: string,
    uac2: string,
    uac3: string,
    uac4?: string
}

export type { InstrumentUacDetails };
