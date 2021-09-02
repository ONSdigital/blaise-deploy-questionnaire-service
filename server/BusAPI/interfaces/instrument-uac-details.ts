interface InstrumentUacDetails {
    [uac: string]: Uac;
}

interface Uac {
    instrument_name: string,
    case_id: string,
    postcode_attempts: number,
    postcode_attempt_timestamp: string,
    uac_chunks: UacChunks
}

interface UacChunks {
    uac1: string,
    uac2: string,
    uac3: string
}

export type {InstrumentUacDetails};
