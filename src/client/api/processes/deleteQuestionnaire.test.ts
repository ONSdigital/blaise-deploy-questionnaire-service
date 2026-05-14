import { clientLogger } from "../../utils/logger";
import { deleteQuestionnaire } from "../questionnaires";
import { deleteTmReleaseDate } from "../tmReleaseDate";
import { deleteToStartDate } from "../toStartDate";

import { deleteQuestionnaireAndRelatedDates } from "./deleteQuestionnaire";

vi.mock("../questionnaires", () => ({
  deleteQuestionnaire: vi.fn(),
}));

vi.mock("../tmReleaseDate", () => ({
  deleteTmReleaseDate: vi.fn(),
}));

vi.mock("../toStartDate", () => ({
  deleteToStartDate: vi.fn(),
}));

vi.mock("../../utils/logger", () => ({
  clientLogger: {
    error: vi.fn(),
  },
}));

describe("deleteQuestionnaireAndRelatedDates", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns a failure when deleting the Telephone Operations start date fails", async () => {
    vi.mocked(deleteToStartDate).mockResolvedValue(false);

    await expect(deleteQuestionnaireAndRelatedDates("OPN2004A")).resolves.toEqual([
      false,
      "Failed to delete Telephone Operations start date",
    ]);
    expect(deleteTmReleaseDate).not.toHaveBeenCalled();
    expect(deleteQuestionnaire).not.toHaveBeenCalled();
    expect(clientLogger.error).toHaveBeenCalledWith("Failed to delete Telephone Operations start date");
  });

  it("returns a failure when deleting the Totalmobile release date fails", async () => {
    vi.mocked(deleteToStartDate).mockResolvedValue(true);
    vi.mocked(deleteTmReleaseDate).mockResolvedValue(false);

    await expect(deleteQuestionnaireAndRelatedDates("OPN2004A")).resolves.toEqual([
      false,
      "Failed to delete Totalmobile release date",
    ]);
    expect(deleteQuestionnaire).not.toHaveBeenCalled();
    expect(clientLogger.error).toHaveBeenCalledWith("Failed to delete Totalmobile release date");
  });

  it("returns a failure when deleting the questionnaire fails", async () => {
    vi.mocked(deleteToStartDate).mockResolvedValue(true);
    vi.mocked(deleteTmReleaseDate).mockResolvedValue(true);
    vi.mocked(deleteQuestionnaire).mockResolvedValue(false);

    await expect(deleteQuestionnaireAndRelatedDates("OPN2004A")).resolves.toEqual([
      false,
      "Failed to delete the questionnaire",
    ]);
    expect(clientLogger.error).toHaveBeenCalledWith("Failed to delete the questionnaire");
  });

  it("returns success when every deletion succeeds", async () => {
    vi.mocked(deleteToStartDate).mockResolvedValue(true);
    vi.mocked(deleteTmReleaseDate).mockResolvedValue(true);
    vi.mocked(deleteQuestionnaire).mockResolvedValue(true);

    await expect(deleteQuestionnaireAndRelatedDates("OPN2004A")).resolves.toEqual([
      true,
      "Deleted successfully",
    ]);
  });
});