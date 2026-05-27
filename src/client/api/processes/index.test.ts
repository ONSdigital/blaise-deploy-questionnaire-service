import { deleteQuestionnaireAndRelatedDates } from "./deleteQuestionnaire";
import { verifyAndInstallQuestionnaire } from "./deployQuestionnaire";
import { generateUacsAndCsvFileData, mapCasesToUacs } from "./generateUacs";
import {
  checkQuestionnaireSettings,
  uploadAndInstallFile,
  validateSelectedQuestionnaireExists,
} from "./uploadQuestionnaire";

import * as processExports from "./index";

describe("client api process index", () => {
  it("re-exports the process helpers", () => {
    expect(processExports.verifyAndInstallQuestionnaire).toBe(verifyAndInstallQuestionnaire);
    expect(processExports.mapCasesToUacs).toBe(mapCasesToUacs);
    expect(processExports.generateUacsAndCsvFileData).toBe(generateUacsAndCsvFileData);
    expect(processExports.deleteQuestionnaireAndRelatedDates).toBe(
      deleteQuestionnaireAndRelatedDates,
    );
    expect(processExports.validateSelectedQuestionnaireExists).toBe(
      validateSelectedQuestionnaireExists,
    );
    expect(processExports.uploadAndInstallFile).toBe(uploadAndInstallFile);
    expect(processExports.checkQuestionnaireSettings).toBe(checkQuestionnaireSettings);
  });
});
