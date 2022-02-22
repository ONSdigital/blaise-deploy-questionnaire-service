import { field_period_to_text } from "./functions";

describe("Field period to text test", () => {
    it("should return 'April 2020' for field period 2004", () => {
        expect(field_period_to_text("OPN2004")
        ).toBe("April 2020");
    });

    it("should return 'January 2020' for field period 2001", () => {
        expect(field_period_to_text("OPN2001")
        ).toBe("January 2020");
    });

    it("should return 'December 2020' for field period 2012", () => {
        expect(field_period_to_text("OPN2012")
        ).toBe("December 2020");
    });

    it("should return an message if the survey is a DST test instrument", () => {
        expect(field_period_to_text("DST2008A")
        ).toBe("Automated tests questionnaire");
    });

    it("should return an unknown message if the survey is unrecognised", () => {
        expect(field_period_to_text("BAS2008")
        ).toBe("Field period unknown");
    });

    it("should return an unknown message if the month is unrecognised", () => {
        expect(field_period_to_text("OPN20AB")
        ).toBe("Unknown 2020");
    });
});
