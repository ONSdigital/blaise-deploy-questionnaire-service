import {
  getStrictInterviewingSettings,
  validateCatiOnlySettings,
  validateQuestionnaireSettings,
} from "./questionnaireSettings";

import type { QuestionnaireSettings } from "blaise-api-node-client";

describe("Function getStrictInterviewingSettings()", () => {
  const questionnaireSettingTestList: QuestionnaireSettings[] = [
    {
      type: "FreeInterviewing",
      saveSessionOnTimeout: false,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 20,
      applyRecordLocking: true,
    },
    {
      type: "StrictInterviewing",
      saveSessionOnTimeout: false,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: false,
    },
  ];

  it("Should return the questionnaire settings for the StrictInterviewing type", async () => {
    const strictInterviewingSettings = getStrictInterviewingSettings(questionnaireSettingTestList);

    expect(strictInterviewingSettings).toEqual({
      type: "StrictInterviewing",
      saveSessionOnTimeout: false,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: false,
    });
  });

  it("returns undefined when strict interviewing settings are missing", () => {
    expect(getStrictInterviewingSettings([questionnaireSettingTestList[0]])).toBeUndefined();
  });
});

describe("Function validateCatiOnlySettings()", () => {
  describe("when the settings are valid", () => {
    const questionnaireSettings = {
      type: "StrictInterviewing",
      saveSessionOnTimeout: true,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: true,
    };

    it("returns true", () => {
      const [valid, invalidSettings] = validateCatiOnlySettings(questionnaireSettings);

      expect(valid).toBeTruthy();
      expect(invalidSettings).toEqual({});
    });
  });

  describe("when the settings are invalid", () => {
    const questionnaireSettings = {
      type: "StrictInterviewing",
      saveSessionOnTimeout: false,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: false,
    };

    it("returns true", () => {
      const [valid, invalidSettings] = validateCatiOnlySettings(questionnaireSettings);

      expect(valid).toBeFalsy();
      expect(invalidSettings.saveSessionOnTimeout).toBeTruthy();
      expect(invalidSettings.applyRecordLocking).toBeTruthy();
      expect(invalidSettings).toEqual({
        applyRecordLocking: true,
        saveSessionOnTimeout: true,
      });
    });
  });
});

describe("Function validateQuestionnaireSettings()", () => {
  describe("when the settings are valid", () => {
    const questionnaireSettings = {
      type: "StrictInterviewing",
      saveSessionOnTimeout: true,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: true,
      deleteSessionOnQuit: true,
      sessionTimeout: 15,
      applyRecordLocking: true,
    };

    it("returns true", () => {
      const [valid, invalidSettings] = validateQuestionnaireSettings(questionnaireSettings);

      expect(valid).toBeTruthy();
      expect(invalidSettings).toEqual({});
    });
  });

  describe("when the settings are invalid", () => {
    const questionnaireSettings = {
      type: "StrictInterviewing",
      saveSessionOnTimeout: true,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: true,
    };

    it("returns true", () => {
      const [valid, invalidSettings] = validateQuestionnaireSettings(questionnaireSettings);

      expect(valid).toBeFalsy();
      expect(invalidSettings.deleteSessionOnTimeout).toBeTruthy();
      expect(invalidSettings.deleteSessionOnQuit).toBeTruthy();
      expect(invalidSettings).toEqual({
        deleteSessionOnTimeout: true,
        deleteSessionOnQuit: true,
      });
    });
  });
});

describe("Mode-based settings validation", () => {
  const questionnaireSettings = {
    type: "StrictInterviewing",
    saveSessionOnTimeout: true,
    saveSessionOnQuit: true,
    deleteSessionOnTimeout: false,
    deleteSessionOnQuit: false,
    sessionTimeout: 15,
    applyRecordLocking: true,
  };

  function validateForModes(modes: string[]) {
    const isCatiModeOnly = modes.length === 1 && modes[0] === "CATI";

    return isCatiModeOnly
      ? validateCatiOnlySettings(questionnaireSettings)
      : validateQuestionnaireSettings(questionnaireSettings);
  }

  describe("when the mode is CATI", () => {
    it("uses cati validation rules and returns true", () => {
      const [valid, invalidSettings] = validateForModes(["CATI"]);

      expect(valid).toBeTruthy();
      expect(invalidSettings).toEqual({});
    });
  });

  describe("when the mode is MIXED", () => {
    it("uses default validation rules and returns false", () => {
      const [valid, invalidSettings] = validateForModes(["CAWI"]);

      expect(valid).toBeFalsy();
      expect(invalidSettings.deleteSessionOnTimeout).toBeTruthy();
      expect(invalidSettings.deleteSessionOnQuit).toBeTruthy();
      expect(invalidSettings).toEqual({
        deleteSessionOnTimeout: true,
        deleteSessionOnQuit: true,
      });
    });
  });
});
