import {
  shouldAskTmReleaseDate,
  shouldAskToStartDate,
  tmReleaseDateSurveyTlas,
} from "./deploymentDateQuestionRules";

describe("deploymentDateQuestionRules", () => {
  it.each(["DST2101A", "LMS2101A", "OPN2101A", "TST2101A"])(
    "asks the Telephone Operations start date question for %s",
    (questionnaireName) => {
      expect(shouldAskToStartDate(questionnaireName)).toBe(true);
    },
  );

  it("does not ask the Telephone Operations start date question for unsupported TLAs", () => {
    expect(shouldAskToStartDate("FRS2101A")).toBe(false);
  });

  it("exports the Totalmobile release date TLAs", () => {
    expect(tmReleaseDateSurveyTlas).toEqual(["DST", "LMS"]);
  });

  it.each(["DST2101A", "LMS2101A"])(
    "asks the Totalmobile release date question for %s",
    (questionnaireName) => {
      expect(shouldAskTmReleaseDate(questionnaireName)).toBe(true);
    },
  );

  it("does not ask the Totalmobile release date question for unsupported TLAs", () => {
    expect(shouldAskTmReleaseDate("OPN2101A")).toBe(false);
  });
});
