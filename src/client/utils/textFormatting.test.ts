import { formatText } from "./textFormatting";

describe("formatText", () => {
  it("formats text to title case without underscores", () => {
    expect(formatText("this_is_a_sentence")).toEqual("This is a sentence");
  });
});
