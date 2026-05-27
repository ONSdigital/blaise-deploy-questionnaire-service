import {
  readNullableStateString,
  readStateNumber,
  readStateQuestionnaire,
  readStateString,
  readStateStringArray,
} from "./locationState";

describe("locationState helpers", () => {
  const questionnaire = {
    name: "OPN2004A",
    installDate: "2024-01-01T00:00:00.000Z",
    serverParkName: "gusty",
    dataRecordCount: 2,
    status: "Active",
    fieldPeriod: "April 2024",
  };

  it("reads string values from state", () => {
    expect(readStateString({ section: "summary" }, "section")).toBe("summary");
    expect(readStateString({ section: 1 }, "section")).toBeUndefined();
    expect(readStateString(null, "section")).toBeUndefined();
  });

  it("reads nullable string values from state", () => {
    expect(readNullableStateString({ toStartDate: "2024-01-01" }, "toStartDate")).toBe(
      "2024-01-01",
    );
    expect(readNullableStateString({ toStartDate: null }, "toStartDate")).toBeNull();
    expect(readNullableStateString({ toStartDate: 1 }, "toStartDate")).toBeUndefined();
  });

  it("reads numeric values from state", () => {
    expect(readStateNumber({ statusCode: 201 }, "statusCode")).toBe(201);
    expect(readStateNumber({ statusCode: "201" }, "statusCode")).toBeUndefined();
  });

  it("reads string arrays from state", () => {
    expect(readStateStringArray({ modes: ["CATI", "CAWI"] }, "modes")).toEqual(["CATI", "CAWI"]);
    expect(readStateStringArray({ modes: ["CATI", 1] }, "modes")).toBeUndefined();
  });

  it("reads questionnaires from state", () => {
    expect(readStateQuestionnaire({ questionnaire }, "questionnaire")).toEqual(questionnaire);
    expect(
      readStateQuestionnaire({ questionnaire: { name: "OPN2004A" } }, "questionnaire"),
    ).toEqual({
      name: "OPN2004A",
    });
    expect(readStateQuestionnaire(undefined, "questionnaire")).toBeUndefined();
    expect(
      readStateQuestionnaire({ questionnaire: { name: 42 } }, "questionnaire"),
    ).toBeUndefined();
  });
});
