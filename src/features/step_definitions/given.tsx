import navigateToDeployPageAndSelectFile, { formatDateString } from "./helpers/functions";
import { DefineStepFunction } from "jest-cucumber";
import { instrumentWithName } from "./helpers/apiMockObjects";
import { InstrumentSettings, Instrument } from "blaise-api-node-client";
import MockAdapter from "axios-mock-adapter";

export function givenTheQuestionnaireIsInstalled(
  given: DefineStepFunction,
  instrumentList: Instrument[],
  mocker: MockAdapter
): void {
  given(/the questionnaire '(.*)' is installed/, (questionnaire: string) => {
    const newInstrument = instrumentWithName(questionnaire);
    if (!instrumentList.some(instrument => instrument.name === questionnaire)) {
      instrumentList.push(newInstrument);
    }
    mocker.onGet("/api/instruments").reply(200, instrumentList);
    mocker.onGet(`/api/instruments/${questionnaire}`).reply(200, newInstrument);
    mocker.onDelete(`/api/instruments/${questionnaire}`).reply(204);
    mocker.onGet(`/api/tostartdate/${questionnaire}`).reply(200);
    mocker.onPost(`/api/tostartdate/${questionnaire}`).reply(200);
    mocker.onDelete(`/api/tostartdate/${questionnaire}`).reply(204);
    mocker.onGet(`/upload/init?filename=${questionnaire}.bpkg`).reply(200, "https://storage.googleapis.com/");
    mocker.onGet(`/upload/verify?filename=${questionnaire}.bpkg`).reply(200, { name: `${questionnaire}.bpkg` });
    mocker.onPost("/api/install").reply(201);
    mocker.onGet(`/api/instruments/${questionnaire}/settings`).reply(200, [
      {
        type: "StrictInterviewing",
        saveSessionOnTimeout: true,
        saveSessionOnQuit: true,
        deleteSessionOnTimeout: true,
        deleteSessionOnQuit: true,
        sessionTimeout: 15,
        applyRecordLocking: true
      }
    ]);
    mocker.onGet(`/api/instruments/${questionnaire}/modes`).reply(200, ["CAWI", "CATI"]);
    mocker.onGet(`/api/uacs/instrument/${questionnaire}/count`).reply(200, { count: 0 });
    mocker.onGet(`/api/instruments/${questionnaire}/surveydays`).reply(200,  [] );
    mocker.onGet(`/api/instruments/${questionnaire}/active`).reply(200,  true );
  });
}

// Just a bunch of default mocks to stop things falling over
export function givenNoQuestionnairesAreInstalled(
  given: DefineStepFunction,
  mocker: MockAdapter
): void {
  given("no questionnaires are installed", () => {
    mocker.onGet("/api/instruments").reply(200, []);
  });
}

export function givenInstallsSuccessfully(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/'(.*)' installs successfully/, (questionnaire: string) => {
    mocker.onDelete(`/api/instruments/${questionnaire}`).reply(204);
    mocker.onGet(`/api/instruments/${questionnaire}`).reply(200);
    mocker.onGet(`/api/tostartdate/${questionnaire}`).reply(200);
    mocker.onPost(`/api/tostartdate/${questionnaire}`).reply(200);
    mocker.onDelete(`/api/tostartdate/${questionnaire}`).reply(204);
    mocker.onGet(`/upload/init?filename=${questionnaire}.bpkg`).reply(200, "https://storage.googleapis.com/");
    mocker.onGet(`/upload/verify?filename=${questionnaire}.bpkg`).reply(200, { name: `${questionnaire}.bpkg` });
    mocker.onPost("/api/install").reply(201);
    mocker.onGet(`/api/instruments/${questionnaire}/settings`).reply(200, [
      {
        type: "StrictInterviewing",
        saveSessionOnTimeout: true,
        saveSessionOnQuit: true,
        deleteSessionOnTimeout: true,
        deleteSessionOnQuit: true,
        sessionTimeout: 15,
        applyRecordLocking: true
      }
    ]);
    mocker.onGet(`/api/instruments/${questionnaire}/modes`).reply(200, ["CAWI", "CATI"]);
    mocker.onGet(`/api/uacs/instrument/${questionnaire}/count`).reply(200, { count: 0 });
    mocker.onPatch(`/api/instruments/${questionnaire}/activate`).reply(204);
    mocker.onPatch(`/api/instruments/${questionnaire}/deactivate`).reply(204);
  });
}

export function givenTheQuestionnaireHasModes(
  given: DefineStepFunction,
  mocker: MockAdapter
): void {
  given(/'(.*)' has the modes '(.*)'/, (questionnaire: string, modes: string) => {
    mocker.onGet(`/api/instruments/${questionnaire}/modes`).reply(200, modes.split(","));
  });
}

export function givenTheQuestionnaireHasCases(
  given: DefineStepFunction,
  instrumentList: Instrument[],
  mocker: MockAdapter
): void {
  given(/'(.*)' has (\d+) cases/, (questionnaire: string, cases: string) => {
    const caseCount: number = +cases;
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        instrument.dataRecordCount = caseCount;
        mocker.onGet(`/api/instruments/${questionnaire}`).reply(200, instrument);
      }
    }
  });
}

export function givenTheQuestionnaireHasUACs(
  given: DefineStepFunction,
  mocker: MockAdapter
): void {
  given(/'(.*)' has (\d+) UACs/, (questionnaire: string, cases: string) => {
    mocker.onGet(`/api/uacs/instrument/${questionnaire}/count`).reply(200, { count: +cases });
  });
}

export function givenTheQuestionnaireIsErroneous(
  given: DefineStepFunction,
  instrumentList: Instrument[],
): void {
  given(/'(.*)' is erroneous/, (questionnaire: string) => {
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        instrument.status = "Failed";
      }
    }
  });
}

export function givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous(
  given: DefineStepFunction,
  mocker: MockAdapter
): void {
  given(/'(.*)' cannot be deleted because it would go erroneous/, (questionnaire: string) => {
    mocker.onDelete(`/api/instruments/${questionnaire}`).reply(420);
    mocker.onGet(`/api/instruments/${questionnaire}`).reply(420);
  });
}


export function givenTOStartDateFails(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/setting a TO start date for '(.*)' fails/, (questionnaire: string) => {
    mocker.onPost(`/api/tostartdate/${questionnaire}`).reply(500);
  });
}

export function givenUACGenerationIsBroken(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/UAC generation is broken for '(.*)'/, (questionnaire: string) => {
    mocker.onPost(`/api/uacs/instrument/${questionnaire}`).reply(500);
  });
}

export function givenTheQuestionnaireHasATOStartDate(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/'(.*)' has a TO start date of '(.*)'/, async (questionnaire: string, toStartDate: string) => {
    mocker.onGet(`/api/tostartdate/${questionnaire}`).reply(200, { tostartdate: formatDateString(toStartDate) });
  });
}

export function givenTheQuestionnaireHasNoTOStartDate(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/'(.*)' has no TO start date/, async (questionnaire: string) => {
    mocker.onGet(`/api/tostartdate/${questionnaire}`).reply(404);
  });
}

export function givenAllInstallsWillFail(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/All Questionnaire installs will fail for '(.*)'/, (questionnaire_matcher: string) => {
    mocker.onPost("/api/install").reply(500);
  });
}

export function givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given: DefineStepFunction): void {
  given(/I have selected the questionnaire package for '(.*)' to deploy/, async (questionnaire: string) => {
    await navigateToDeployPageAndSelectFile(questionnaire);
  });
}

export function givenTheQuestionnaireIsLive(
  given: DefineStepFunction,
  instrumentList: Instrument[],
  mocker: MockAdapter
): void {
  given(/'(.*)' is live/, (questionnaire: string) => {
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        console.log(questionnaire);
        instrument.hasData = true;
        instrument.active = true;

        mocker.onGet(`/api/instruments/${questionnaire}`).reply(200, instrument);
      }
    }
  });
}

export function givenTheQuestionnaireIsActive(
  given: DefineStepFunction,
  instrumentList: Instrument[],
  mocker: MockAdapter
): void {
  given(/'(.*)' is active/, (questionnaire: string) => {
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        console.log(questionnaire);
        instrument.status = "active";

        mocker.onGet(`/api/instruments/${questionnaire}`).reply(200, instrument);
      }
    }
  });
}

export function givenTheQuestionnaireIsInactive(
  given: DefineStepFunction,
  instrumentList: Instrument[],
  mocker: MockAdapter
): void {
  given(/'(.*)' is inactive/, (questionnaire: string) => {
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        console.log(questionnaire);
        instrument.status = "inactive";

        mocker.onGet(`/api/instruments/${questionnaire}`).reply(200, instrument);
      }
    }
  });
}

export function givenTheQuestionnaireHasActiveSurveyDays(
  given: DefineStepFunction,
  instrumentList: Instrument[],
  mocker: MockAdapter
): void {
  given(/'(.*)' has active survey days/, (questionnaire: string) => {
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        console.log(questionnaire);
        mocker.onGet(`/api/instruments/${questionnaire}/active`).reply(200, true);
      }
    }
  });
}

export function givenTheQuestionnareHasTheSettings(given: DefineStepFunction, mocker: MockAdapter): void {
  given(/'(.*)' has the settings:/, (questionnaire: string, table: any[]) => {
    const settings: InstrumentSettings[] = [];
    table.forEach((row: any) => {
      settings.push({
        type: row.type,
        saveSessionOnTimeout: row.saveSessionOnTimeout === "true",
        saveSessionOnQuit: row.saveSessionOnQuit === "true",
        deleteSessionOnTimeout: row.deleteSessionOnTimeout === "true",
        deleteSessionOnQuit: row.deleteSessionOnQuit === "true",
        sessionTimeout: row.sessionTimeout,
        applyRecordLocking: row.applyRecordLocking === "true",
      });
    });
    mocker.onGet(`/api/instruments/${questionnaire}/settings`).reply(200, settings);
  });
}
