type DefineStepFunction = (name: string | RegExp, callback: (...args: never[]) => unknown) => void;

import { questionnaireWithName } from "./helpers/api.mock";
import { formatDateString, navigateToDeployPageAndSelectFile } from "./helpers/functions";

import type MockAdapter from "axios-mock-adapter";
import type { Questionnaire, QuestionnaireSettings } from "blaise-api-node-client";

export function givenQuestionnaireInstalled(
  given: DefineStepFunction,
  questionnaireList: Questionnaire[],
  mocker: MockAdapter,
): void {
  given(/the questionnaire '(.*)' is installed/, (questionnaireName: string) => {
    const newQuestionnaire = questionnaireWithName(questionnaireName);

    if (!questionnaireList.some((questionnaire) => questionnaire.name === questionnaireName)) {
      questionnaireList.push(newQuestionnaire);
    }

    mocker.onGet("/api/questionnaires").reply(200, questionnaireList);
    mocker.onGet(`/api/questionnaires/${questionnaireName}`).reply(200, newQuestionnaire);
    mocker.onDelete(`/api/questionnaires/${questionnaireName}`).reply(204);
    mocker.onGet(`/api/tostartdate/${questionnaireName}`).reply(200);
    mocker.onPost(`/api/tostartdate/${questionnaireName}`).reply(200);
    mocker.onDelete(`/api/tostartdate/${questionnaireName}`).reply(204);
    mocker.onPost(`/api/tmreleasedate/${questionnaireName}`).reply(200);
    mocker.onDelete(`/api/tmreleasedate/${questionnaireName}`).reply(204);
    mocker
      .onGet(`/upload/init?filename=${questionnaireName}.bpkg`)
      .reply(200, "https://storage.googleapis.com/");
    mocker
      .onGet(`/upload/verify?filename=${questionnaireName}.bpkg`)
      .reply(200, { name: `${questionnaireName}.bpkg` });
    mocker.onPost("/api/install").reply(201);
    mocker.onGet(`/api/questionnaires/${questionnaireName}/settings`).reply(200, [
      {
        type: "StrictInterviewing",
        saveSessionOnTimeout: true,
        saveSessionOnQuit: true,
        deleteSessionOnTimeout: true,
        deleteSessionOnQuit: true,
        sessionTimeout: 15,
        applyRecordLocking: true,
      },
    ]);
    mocker.onGet(`/api/questionnaires/${questionnaireName}/modes`).reply(200, ["CAWI", "CATI"]);
    mocker.onGet(`/api/uacs/instrument/${questionnaireName}/count`).reply(200, { count: 0 });
    mocker.onGet(`/api/questionnaires/${questionnaireName}/surveydays`).reply(200, []);
    mocker.onGet(`/api/questionnaires/${questionnaireName}/active`).reply(200, true);
    mocker.onPost("/api/client-log").reply(200);
  });
}

// Just a bunch of default mocks to stop things falling over
export function givenNoQuestionnairesInstalled(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given("no questionnaires are installed", () => {
    mocker.onGet("/api/questionnaires").reply(200, []);
    mocker.onGet(/^\/api\/questionnaires\/[^/]+$/).replyOnce(404);
    mocker.onPost("/api/client-log").reply(200);
  });
}

export function givenQuestionnaireInstallsSuccessfully(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given(/'(.*)' installs successfully/, (questionnaireName: string) => {
    mocker.onDelete(`/api/questionnaires/${questionnaireName}`).reply(204);
    mocker.onGet(`/api/questionnaires/${questionnaireName}`).reply(200);
    mocker.onGet(`/api/tostartdate/${questionnaireName}`).reply(200);
    mocker.onPost(`/api/tostartdate/${questionnaireName}`).reply(200);
    mocker.onDelete(`/api/tostartdate/${questionnaireName}`).reply(204);
    mocker
      .onGet(`/upload/init?filename=${questionnaireName}.bpkg`)
      .reply(200, "https://storage.googleapis.com/");
    mocker
      .onGet(`/upload/verify?filename=${questionnaireName}.bpkg`)
      .reply(200, { name: `${questionnaireName}.bpkg` });
    mocker.onPost("/api/install").reply(201);
    mocker.onGet(`/api/questionnaires/${questionnaireName}/settings`).reply(200, [
      {
        type: "StrictInterviewing",
        saveSessionOnTimeout: true,
        saveSessionOnQuit: true,
        deleteSessionOnTimeout: true,
        deleteSessionOnQuit: true,
        sessionTimeout: 15,
        applyRecordLocking: true,
      },
    ]);
    mocker.onGet(`/api/questionnaires/${questionnaireName}/modes`).reply(200, ["CAWI", "CATI"]);
    mocker.onGet(`/api/uacs/instrument/${questionnaireName}/count`).reply(200, { count: 0 });
    mocker.onPatch(`/api/questionnaires/${questionnaireName}/activate`).reply(204);
    mocker.onPatch(`/api/questionnaires/${questionnaireName}/deactivate`).reply(204);
  });
}

export function givenQuestionnaireHasModes(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/'(.*)' has the modes '(.*)'/, (questionnaireName: string, modes: string) => {
    mocker.onGet(`/api/questionnaires/${questionnaireName}/modes`).reply(200, modes.split(","));
  });
}

export function givenQuestionnaireHasCases(
  given: DefineStepFunction,
  questionnaireList: Questionnaire[],
  mocker: MockAdapter,
): void {
  given(/'(.*)' has (\d+) cases/, (questionnaireName: string, cases: string) => {
    const caseCount: number = +cases;

    for (const questionnaire of questionnaireList) {
      if (questionnaire.name === questionnaireName) {
        questionnaire.dataRecordCount = caseCount;
        mocker.onGet(`/api/questionnaires/${questionnaireName}`).reply(200, questionnaire);
        mocker.onGet(`/api/uacs/instrument/${questionnaireName}/count`).reply(200, {
          count: Math.max(caseCount, 0),
        });
      }
    }
  });
}

export function givenQuestionnaireHasUacs(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/^'(.*?)' has (\d+) Unique Access Codes$/, (questionnaireName: string, count: string) => {
    mocker.onGet(`/api/uacs/instrument/${questionnaireName}/count`).reply(200, { count: +count });
  });
}

export function givenQuestionnaireIsErroneous(
  given: DefineStepFunction,
  questionnaireList: Questionnaire[],
): void {
  given(/'(.*)' is erroneous/, (questionnaireName: string) => {
    for (const questionnaire of questionnaireList) {
      if (questionnaire.name === questionnaireName) {
        questionnaire.status = "Failed";
      }
    }
  });
}

export function givenToStartDateFails(given: DefineStepFunction, mocker: MockAdapter): void {
  given(
    /setting a Telephone Operations start date for '(.*)' fails/,
    (questionnaireName: string) => {
      mocker.onPost(`/api/tostartdate/${questionnaireName}`).reply(500);
    },
  );
}

export function givenUacGenerationFails(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/Unique Access Code generation is broken for '(.*)'/, (questionnaireName: string) => {
    mocker.onPost(`/api/uacs/instrument/${questionnaireName}`).reply(500);
  });
}

export function givenQuestionnaireHasToStartDate(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given(
    /'(.*)' has a Telephone Operations start date of '(.*)'/,
    async (questionnaireName: string, toStartDate: string) => {
      mocker
        .onGet(`/api/tostartdate/${questionnaireName}`)
        .reply(200, { tostartdate: formatDateString(toStartDate) });
    },
  );
}

export function givenQuestionnaireHasTmReleaseDate(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given(
    /'(.*)' has a Totalmobile release date of '(.*)'/,
    async (questionnaireName: string, tmReleaseDate: string) => {
      mocker
        .onGet(`/api/tmreleasedate/${questionnaireName}`)
        .reply(200, { tmreleasedate: formatDateString(tmReleaseDate) });
    },
  );
}

export function givenQuestionnaireHasNoToStartDate(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given(/'(.*)' has no Telephone Operations start date/, async (questionnaireName: string) => {
    mocker.onGet(`/api/tostartdate/${questionnaireName}`).reply(404);
  });
}

export function givenQuestionnaireHasNoTmReleaseDate(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given(/'(.*)' has no Totalmobile release date/, async (questionnaireName: string) => {
    mocker.onGet(`/api/tmreleasedate/${questionnaireName}`).reply(404);
  });
}

export function givenAllInstallsFail(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/All Questionnaire installs will fail for '(.*)'/, (questionnaireName: string) => {
    mocker.onGet(`/api/questionnaires/${questionnaireName}`).reply(404);
    mocker
      .onGet(`/upload/init?filename=${questionnaireName}.bpkg`)
      .reply(200, "https://storage.googleapis.com/");
    mocker.onPut("https://storage.googleapis.com/").reply(200);
    mocker
      .onGet(`/upload/verify?filename=${questionnaireName}.bpkg`)
      .reply(200, { name: `${questionnaireName}.bpkg` });
    mocker.onPost("/api/install").reply(500);
    mocker.onPost("/api/client-log").reply(200);
  });
}

export function givenPackageSelectedForDeploy(given: DefineStepFunction): void {
  given(
    /I have selected the questionnaire package for '(.*)' to deploy/,
    async (questionnaireName: string) => {
      await navigateToDeployPageAndSelectFile(questionnaireName);
    },
  );
}

export function givenQuestionnaireIsLive(
  given: DefineStepFunction,
  questionnaireList: Questionnaire[],
  mocker: MockAdapter,
): void {
  given(/'(.*)' is live/, (questionnaireName: string) => {
    for (const questionnaire of questionnaireList) {
      if (questionnaire.name === questionnaireName) {
        questionnaire.hasData = true;
        questionnaire.active = true;

        mocker.onGet(`/api/questionnaires/${questionnaireName}`).reply(200, questionnaire);
      }
    }
  });
}

export function givenQuestionnaireIsActive(
  given: DefineStepFunction,
  questionnaireList: Questionnaire[],
  mocker: MockAdapter,
): void {
  given(/'(.*)' is active/, (questionnaireName: string) => {
    for (const questionnaire of questionnaireList) {
      if (questionnaire.name === questionnaireName) {
        questionnaire.status = "active";

        mocker.onGet(`/api/questionnaires/${questionnaireName}`).reply(200, questionnaire);
      }
    }
  });
}

export function givenQuestionnaireIsInactive(
  given: DefineStepFunction,
  questionnaireList: Questionnaire[],
  mocker: MockAdapter,
): void {
  given(/'(.*)' is inactive/, (questionnaireName: string) => {
    for (const questionnaire of questionnaireList) {
      if (questionnaire.name === questionnaireName) {
        questionnaire.status = "inactive";

        mocker.onGet(`/api/questionnaires/${questionnaireName}`).reply(200, questionnaire);
      }
    }
  });
}

export function givenQuestionnaireHasActiveSurveyDays(
  given: DefineStepFunction,
  questionnaireList: Questionnaire[],
  mocker: MockAdapter,
): void {
  given(/'(.*)' has active survey days/, (questionnaireName: string) => {
    for (const questionnaire of questionnaireList) {
      if (questionnaire.name === questionnaireName) {
        mocker.onGet(`/api/questionnaires/${questionnaireName}/active`).reply(200, true);
      }
    }
  });
}

export function givenQuestionnaireHasSettings(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given(
    /'(.*)' has the settings:/,
    (questionnaireName: string, table: Array<Record<string, string>>) => {
      const settings: QuestionnaireSettings[] = [];

      table.forEach((row) => {
        settings.push({
          type: row.type,
          saveSessionOnTimeout: row.saveSessionOnTimeout === "true",
          saveSessionOnQuit: row.saveSessionOnQuit === "true",
          deleteSessionOnTimeout: row.deleteSessionOnTimeout === "true",
          deleteSessionOnQuit: row.deleteSessionOnQuit === "true",
          sessionTimeout: Number(row.sessionTimeout),
          applyRecordLocking: row.applyRecordLocking === "true",
        });
      });

      mocker.onGet(`/api/questionnaires/${questionnaireName}/settings`).reply(200, settings);
    },
  );
}
