import { formatText } from "./textFormatting";

describe("formatText", () => {
    it("formats text to title case without underscores", () => {
        expect(formatText("this_is_a_sentance")).toEqual("This is a sentance");
    });
});
