import { createValidateRadio } from "./setDate";

describe("SetDate validation", () => {
  it("requires an option to be selected", () => {
    const validate = createValidateRadio({}, "toStartDate", "Telephone Operations start date");

    expect(validate("")).toBe("Select an option");
  });

  it("requires a date when yes is selected", () => {
    const validate = createValidateRadio(
      { askDate: "yes" },
      "tmReleaseDate",
      "Totalmobile release date",
    );

    expect(validate("yes")).toBe("Enter a Totalmobile release date");
  });
});
