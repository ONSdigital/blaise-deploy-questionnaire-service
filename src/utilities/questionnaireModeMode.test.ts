import {
    GetQuestionnaireMode,
    QuestionnaireMode
} from "./questionnaireMode";

describe("Function GetQuestionnaireMode()", () => {
    it("returns mixed when multiple modes are present", () => {
        expect(GetQuestionnaireMode(["CATI", "CAWI"])).toEqual(QuestionnaireMode.Mixed);
    });

    it("returns mixed when no modes are present", () => {
        expect(GetQuestionnaireMode([])).toEqual(QuestionnaireMode.Mixed);
    });

    it("returns mixed when only one mode is present and its not CATI", () => {
        expect(GetQuestionnaireMode(["CAWI"])).toEqual(QuestionnaireMode.Mixed);
    });

    it("returns cati when only one mode is present and it is CATI", () => {
        expect(GetQuestionnaireMode(["CATI"])).toEqual(QuestionnaireMode.Cati);
    });
});
