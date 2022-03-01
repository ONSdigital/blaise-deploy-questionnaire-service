import { fieldPeriodToText } from "./functions";

describe("Field period to text test", () => {
    it("should return 'April 2020' for field period 2004", () => {
        expect(fieldPeriodToText("OPN2004")
        ).toBe("April 2020");
    });

    it("should return 'January 2020' for field period 2001", () => {
        expect(fieldPeriodToText("OPN2001")
        ).toBe("January 2020");
    });

    it("should return 'December 2020' for field period 2012", () => {
        expect(fieldPeriodToText("OPN2012")
        ).toBe("December 2020");
    });

    it("should return 'August 2020' for field period 2012", () => {
        expect(fieldPeriodToText("DST2008A")
        ).toBe("August 2020");
    });

    it("should return 'August 2020' for field period 2012", () => {
        expect(fieldPeriodToText("BAS2008")
        ).toBe("August 2020");
    });

    it("should return 'February 2020' for field period 2012", () => {
        expect(fieldPeriodToText("LMS2102_CC1")
        ).toBe("February 2021");
    });

    it("should return an unknown message if the month is unrecognised", () => {
        expect(fieldPeriodToText("OPN20AB")
        ).toBe("Field period unknown");
    });
});
