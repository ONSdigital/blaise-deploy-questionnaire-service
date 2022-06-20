import { QuestionnaireSettings } from "blaise-api-node-client";
import { QuestionnaireMode } from "./questionnaireMode";
import {
  GetStrictInterviewingSettings,
  ValidateCATIModeSettings,
  ValidateMixedModeSettings,
  ValidateSettings
} from "./questionnaireSettings";

describe("Function GetStrictInterviewingSettings()", () => {
  const questionnaireSettingTestList: QuestionnaireSettings[] = [
    {
      type: "FreeInterviewing",
      saveSessionOnTimeout: false,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 20,
      applyRecordLocking: true
    },
    {
      type: "StrictInterviewing",
      saveSessionOnTimeout: false,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: false
    }
  ];

  it("Should return the questionnaire settings for the StrictInterviewing type", async () => {
    const strictInterviewingSettings = GetStrictInterviewingSettings(questionnaireSettingTestList);
    expect(strictInterviewingSettings).toEqual({
      type: "StrictInterviewing",
      saveSessionOnTimeout: false,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: false
    });
  });
});

describe("Function ValidateCATIModeSettings()", () => {
  describe("when the settings are valid", () => {
    const questionnaireSettings = {
      type: "StrictInterviewing",
      saveSessionOnTimeout: true,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: true
    };

    it("returns true", () => {
      const [valid, invalidSettings] = ValidateCATIModeSettings(questionnaireSettings);
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
      applyRecordLocking: false
    };

    it("returns true", () => {
      const [valid, invalidSettings] = ValidateCATIModeSettings(questionnaireSettings);
      expect(valid).toBeFalsy();
      expect(invalidSettings.saveSessionOnTimeout).toBeTruthy();
      expect(invalidSettings.applyRecordLocking).toBeTruthy();
      expect(invalidSettings).toEqual({
        "applyRecordLocking": true, "saveSessionOnTimeout": true
      });
    });
  });
});


describe("Function ValidateMixedModeSettings()", () => {
  describe("when the settings are valid", () => {
    const questionnaireSettings = {
      type: "StrictInterviewing",
      saveSessionOnTimeout: true,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: true,
      deleteSessionOnQuit: true,
      sessionTimeout: 15,
      applyRecordLocking: true
    };

    it("returns true", () => {
      const [valid, invalidSettings] = ValidateMixedModeSettings(questionnaireSettings);
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
      applyRecordLocking: true
    };

    it("returns true", () => {
      const [valid, invalidSettings] = ValidateMixedModeSettings(questionnaireSettings);
      expect(valid).toBeFalsy();
      expect(invalidSettings.deleteSessionOnTimeout).toBeTruthy();
      expect(invalidSettings.deleteSessionOnQuit).toBeTruthy();
      expect(invalidSettings).toEqual({
        "deleteSessionOnTimeout": true, "deleteSessionOnQuit": true
      });
    });
  });
});


describe("Function ValidateSettings()", () => {
  const questionnaireSettings = {
    type: "StrictInterviewing",
    saveSessionOnTimeout: true,
    saveSessionOnQuit: true,
    deleteSessionOnTimeout: false,
    deleteSessionOnQuit: false,
    sessionTimeout: 15,
    applyRecordLocking: true
  };

  describe("when the mode is CATI", () => {
    it("uses cati validation rules and returns true", () => {
      const [valid, invalidSettings] = ValidateSettings(questionnaireSettings, QuestionnaireMode.Cati);
      expect(valid).toBeTruthy();
      expect(invalidSettings).toEqual({});
    });
  });

  describe("when the mode is MIXED", () => {
    it("uses cawi validation rules and returns false", () => {
      const [valid, invalidSettings] = ValidateSettings(questionnaireSettings, QuestionnaireMode.Mixed);
      expect(valid).toBeFalsy();
      expect(invalidSettings.deleteSessionOnTimeout).toBeTruthy();
      expect(invalidSettings.deleteSessionOnQuit).toBeTruthy();
      expect(invalidSettings).toEqual({
        "deleteSessionOnTimeout": true, "deleteSessionOnQuit": true
      });
    });
  });
});
