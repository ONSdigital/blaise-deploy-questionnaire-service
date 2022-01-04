import { InstrumentUacDetailsByCaseId } from "bus-api-node-client";

export const uacDetails: InstrumentUacDetailsByCaseId = {
    "100000001": {
        instrument_name: "dst2106a",
        case_id: "100000001",
        uac_chunks: {
            uac1: "0009",
            uac2: "7565",
            uac3: "3827"
        }
    },
    "100000002": {
        instrument_name: "dst2106a",
        case_id: "100000002",
        uac_chunks: {
            uac1: "3453",
            uac2: "6545",
            uac3: "4564"
        }
    },
    "100000003": {
        instrument_name: "dst2106a",
        case_id: "100000003",
        uac_chunks: {
            uac1: "9789",
            uac2: "7578",
            uac3: "5367"
        }
    }
};

export const uacDetailsFormattedToCSV = [
    {
        serial_number: "100000001",
        UAC1: "0009",
        UAC2: "7565",
        UAC3: "3827"
    },
    {
        serial_number: "100000002",
        UAC1: "3453",
        UAC2: "6545",
        UAC3: "4564"
    },
    {
        serial_number: "100000003",
        UAC1: "9789",
        UAC2: "7578",
        UAC3: "5367"
    }
];
