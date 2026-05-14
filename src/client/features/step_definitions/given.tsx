type DefineStepFunction = (name: any, callback: any) => void;

import { questionnaireWithName } from "./helpers/api.mock";
import { formatDateString, navigateToDeployPageAndSelectFile } from "./helpers/functions";

import type MockAdapter from "axios-mock-adapter";
import type { Questionnaire, QuestionnaireSettings } from "blaise-api-node-client";

export function givenTheQuestionnaireIsInstalled(
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
  });
}

// Just a bunch of default mocks to stop things falling over
export function givenNoQuestionnairesAreInstalled(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given("no questionnaires are installed", () => {
    mocker.onGet("/api/questionnaires").reply(200, []);
  });
}

export function givenInstallsSuccessfully(given: DefineStepFunction, mocker: MockAdapter): void {
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

export function givenTheQuestionnaireHasModes(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given(/'(.*)' has the modes '(.*)'/, (questionnaireName: string, modes: string) => {
    mocker.onGet(`/api/questionnaires/${questionnaireName}/modes`).reply(200, modes.split(","));
  });
}

export function givenTheQuestionnaireHasCases(
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

export function givenTheQuestionnaireHasUacs(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/^'(.*?)' has (\d+) Unique Access Codes$/, (questionnaireName: string, count: string) => {
    mocker.onGet(`/api/uacs/instrument/${questionnaireName}/count`).reply(200, { count: +count });
  });
}

export function givenTheQuestionnaireIsErroneous(
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

export function givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given(/'(.*)' cannot be deleted because it would go erroneous/, (questionnaireName: string) => {
    mocker.onDelete(`/api/questionnaires/${questionnaireName}`).reply(420);
  });
}

export function givenToStartDateFails(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/setting a Telephone Operations start date for '(.*)' fails/, (questionnaireName: string) => {
    mocker.onPost(`/api/tostartdate/${questionnaireName}`).reply(500);
  });
}

export function givenUacGenerationIsBroken(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/Unique Access Code generation is broken for '(.*)'/, (questionnaireName: string) => {
    mocker.onPost(`/api/uacs/instrument/${questionnaireName}`).reply(500);
  });
}

export function givenTheQuestionnaireHasAToStartDate(
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

export function givenTheQuestionnaireHasATotalmobileReleaseDate(
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

export function givenTheQuestionnaireHasNoToStartDate(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given(/'(.*)' has no Telephone Operations start date/, async (questionnaireName: string) => {
    mocker.onGet(`/api/tostartdate/${questionnaireName}`).reply(404);
  });
}

export function givenTheQuestionnaireHasNoTotalmobileReleaseDate(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given(/'(.*)' has no Totalmobile release date/, async (questionnaireName: string) => {
    mocker.onGet(`/api/tmreleasedate/${questionnaireName}`).reply(404);
  });
}

export function givenAllInstallsWillFail(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/All Questionnaire installs will fail for '(.*)'/, () => {
    mocker.onPost("/api/install").reply(500);
  });
}

export function givenIHaveSelectedTheQuestionnairePackageToDeploy(given: DefineStepFunction): void {
  given(
    /I have selected the questionnaire package for '(.*)' to deploy/,
    async (questionnaireName: string) => {
      await navigateToDeployPageAndSelectFile(questionnaireName);
    },
  );
}

export function givenTheQuestionnaireIsLive(
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

export function givenTheQuestionnaireIsActive(
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

export function givenTheQuestionnaireIsInactive(
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

export function givenTheQuestionnaireHasActiveSurveyDays(
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

export function givenTheQuestionnaireHasTheSettings(
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

export function givenTheQuestionnaireDoesNotHaveATotalmobileReleaseDate(
  given: DefineStepFunction,
  mocker: MockAdapter,
): void {
  given(/'(.*)' does not have a Totalmobile release date/, async (questionnaireName: string) => {
    mocker.onGet(`/api/tmreleasedate/${questionnaireName}`).reply(404);
  });
}
