interface UacChunks {
  uac1: string;
  uac2: string;
  uac3: string;
  uac4?: string;
}

interface UacDetail {
  case_id: string;
  instrument_name: string;
  uac_chunks: UacChunks;
  full_uac?: string;
}

export type InstrumentUacDetails = Record<string, UacDetail>;

export type InstrumentUacDetailsByCaseId = InstrumentUacDetails;
