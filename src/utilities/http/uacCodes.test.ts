import {uacDetails, uacDetailsFormattedToCSV} from "./mocks/uacList";
import {mapUACsToCSVFile} from "./uacCodes";

describe("Function mapUACsToCSVFile(uacList: InstrumentUacDetails | null) ", () => {

    it("It should return a correctly formatted array of cases with UAC codes", async () => {
        const uacDetailsFormatted = mapUACsToCSVFile(uacDetails);
        expect(uacDetailsFormatted).toEqual(uacDetailsFormattedToCSV);
    });

    it("It should return an empty list when uacDetails is null", async () => {
        const uacDetailsFormatted = mapUACsToCSVFile(null);
        expect(uacDetailsFormatted).toEqual([]);
    });

    it("It should return an empty list when uacDetails is an empty object", async () => {
        const uacDetailsFormatted = mapUACsToCSVFile({});
        expect(uacDetailsFormatted).toEqual([]);
    });
});
