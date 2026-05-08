import { installQuestionnaire } from "../questionnaires";
import { validateUploadIsComplete } from "../upload";

import { verifyAndInstallQuestionnaire } from "./deployQuestionnaire";

vi.mock("../upload", () => ({
  validateUploadIsComplete: vi.fn(),
}));

vi.mock("../questionnaires", () => ({
  installQuestionnaire: vi.fn(),
}));

vi.mock("../../client/logger", () => ({
  clientLogger: {
    error: vi.fn(),
  },
}));

describe("verifyAndInstallQuestionnaire", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns failure when upload validation fails", async () => {
    vi.mocked(validateUploadIsComplete).mockResolvedValue(false);

    await expect(verifyAndInstallQuestionnaire("OPN2004A.bpkg")).resolves.toEqual([
      false,
      "Failed to validate if file has been uploaded successfully",
    ]);
    expect(installQuestionnaire).not.toHaveBeenCalled();
  });

  it("returns failure when install fails", async () => {
    vi.mocked(validateUploadIsComplete).mockResolvedValue(true);
    vi.mocked(installQuestionnaire).mockResolvedValue(false);

    await expect(verifyAndInstallQuestionnaire("OPN2004A.bpkg")).resolves.toEqual([
      false,
      "Failed to install the questionnaire",
    ]);
  });
});
