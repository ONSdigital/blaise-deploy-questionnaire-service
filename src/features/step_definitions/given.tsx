import navigateToDeployPageAndSelectFile, { formatDateString } from "./helpers/functions";
import { DefineStepFunction } from "jest-cucumber";
import { instrumentWithName } from "./helpers/apiMockObjects";
import { Mocker } from "./helpers/mocker";
import { InstrumentSettings, Instrument } from "blaise-api-node-client";

export const givenTheQuestionnaireIsInstalled = (
  given: DefineStepFunction,
  instrumentList: Instrument[],
  mocker: Mocker
): void => {
  given(/the questionnaire '(.*)' is installed/, (questionnaire: string) => {
    const newInstrument = instrumentWithName(questionnaire);
    if (!instrumentList.some(instrument => instrument.name === questionnaire)) {
      instrumentList.push(newInstrument);
    }
    mocker.set({
      Path: "/api/instruments",
      Status: 200,
      JSON: instrumentList
    });
    mocker.set({
      Path: `/api/instruments/${questionnaire}`,
      Status: 200,
      JSON: newInstrument
    });
    mocker.set({
      Path: `/api/instruments/${questionnaire}`,
      Method: "DELETE",
      Status: 204
    });
    mocker.set({
      Path: `/api/tostartdate/${questionnaire}`,
      Method: "POST",
      Status: 200
    });
    mocker.set({
      Path: `/api/tostartdate/${questionnaire}`,
      Status: 204
    });
    mocker.set({
      Path: `/upload/init?filename=${questionnaire}.bpkg`,
      Status: 200,
      JSON: "https://storage.googleapis.com/"
    });
    mocker.set({
      Path: `/upload/verify?filename=${questionnaire}.bpkg`,
      Status: 200,
      JSON: { name: `${questionnaire}.bpkg` }
    });
    mocker.set({
      Path: `/api/install?filename=${questionnaire}.bpkg`,
      Status: 201,
      JSON: ""
    });
    mocker.set({
      Path: `/api/instruments/${questionnaire}/settings`,
      Status: 200,
      JSON: [
        {
          type: "StrictInterviewing",
          saveSessionOnTimeout: true,
          saveSessionOnQuit: true,
          deleteSessionOnTimeout: true,
          deleteSessionOnQuit: true,
          sessionTimeout: 15,
          applyRecordLocking: true
        }
      ]
    });
    mocker.set({
      Path: `/api/instruments/${questionnaire}/modes`,
      Status: 200,
      JSON: ["CAWI", "CATI"]
    });
    // mocker.applyMocks();
  });
};

// Just a bunch of default mocks to stop things falling over
export const givenNoQuestionnairesAreInstalled = (
  given: DefineStepFunction,
  mocker: Mocker
): void => {
  given("no questionnaires are installed", () => {
    mocker.set({
      Path: "/api/instruments/",
      Status: 404
    });
    mocker.set({
      Path: "/api/instruments",
      Status: 200,
      JSON: []
    });
    mocker.set({
      Path: "/api/tostartdate/",
      Status: 204
    });
    mocker.set({
      Path: "/api/tostartdate/",
      Method: "POST",
      Status: 200
    });
    mocker.set({
      Path: "/upload/init",
      Status: 200,
      JSON: "https://storage.googleapis.com/"
    });
    mocker.set({
      Path: "/upload/verify",
      Status: 200
    });
    mocker.set({
      Path: "/api/install",
      Status: 201
    });
    mocker.set({
      Path: "/settings",
      Status: 200,
      JSON: [
        {
          type: "StrictInterviewing",
          saveSessionOnTimeout: true,
          saveSessionOnQuit: true,
          deleteSessionOnTimeout: true,
          deleteSessionOnQuit: true,
          sessionTimeout: 15,
          applyRecordLocking: true
        }
      ]
    });
    mocker.set({
      Path: "/modes",
      Status: 200,
      JSON: ["CAWI", "CATI"]
    });
    // mocker.applyMocks();
  });
};

export const givenInstallsSuccessfully = (given: DefineStepFunction, mocker: Mocker): void => {
  given(/'(.*)' installs successfully/, (questionnaire: string) => {
    mocker.set({
      Path: `/upload/verify?filename=${questionnaire}.bpkg`,
      Status: 200,
      JSON: { name: `${questionnaire}.bpkg` }
    });
    mocker.set({
      Path: `/api/instruments/${questionnaire}/settings`,
      Status: 200,
      JSON: [
        {
          type: "StrictInterviewing",
          saveSessionOnTimeout: true,
          saveSessionOnQuit: true,
          deleteSessionOnTimeout: true,
          deleteSessionOnQuit: true,
          sessionTimeout: 15,
          applyRecordLocking: true
        }
      ]
    });
    mocker.set({
      Path: `/api/instruments/${questionnaire}/modes`,
      Status: 200,
      JSON: ["CAWI", "CATI"]
    });
    mocker.set({
      Path: `/api/instruments/${questionnaire}/activate`,
      Status: 204
    });
    mocker.set({
      Path: `/api/instruments/${questionnaire}/deactivate`,
      Status: 204
    });
    // mocker.applyMocks();
  });
};

export const givenTheQuestionnaireHasModes = (
  given: DefineStepFunction,
  mocker: Mocker
): void => {
  given(/'(.*)' has the modes '(.*)'/, (questionnaire: string, modes: string) => {
    mocker.set({
      Path: `/api/instruments/${questionnaire}/modes`,
      Status: 200,
      JSON: modes.split(",")
    });
    // mocker.applyMocks();
  });
};

export const givenTheQuestionnaireHasCases = (
  given: DefineStepFunction,
  instrumentList: Instrument[],
): void => {
  given(/'(.*)' has (\d+) cases/, (questionnaire: string, cases: string) => {
    const caseCount: number = +cases;
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        instrument.dataRecordCount = caseCount;
      }
    }
  });
};

export const givenTheQuestionnaireHasUACs = (
  given: DefineStepFunction,
  mocker: Mocker
): void => {
  given(/'(.*)' has (\d+) UACs/, (questionnaire: string, cases: string) => {
    mocker.set({
      Path: `/api/uacs/instrument/${questionnaire}/count`,
      Status: 200,
      JSON: { count: +cases }
    });
    // mocker.applyMocks();
  });
};

export const givenTheQuestionnaireIsErroneous = (
  given: DefineStepFunction,
  instrumentList: Instrument[],
): void => {
  given(/'(.*)' is erroneous/, (questionnaire: string) => {
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        instrument.status = "Failed";
      }
    }
  });
};

export const givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous = (
  given: DefineStepFunction,
  mocker: Mocker
): void => {
  given(/'(.*)' cannot be deleted because it would go erroneous/, (questionnaire: string) => {
    mocker.set({
      Path: `/api/instruments/${questionnaire}`,
      Method: "DELETE",
      Status: 420
    });
    mocker.set({
      Path: `/api/instruments/${questionnaire}`,
      Status: 420
    });
    // mocker.applyMocks();
  });
};

export const givenTOStartDateFails = (given: DefineStepFunction, mocker: Mocker): void => {
  given(/setting a TO start date for '(.*)' fails/, (questionnaire: string) => {
    mocker.set({
      Path: `/api/tostartdate/${questionnaire}`,
      Status: 500
    });
    // mocker.applyMocks();
  });
};

export const givenUACGenerationIsBroken = (given: DefineStepFunction, mocker: Mocker): void => {
  given(/UAC generation is broken for '(.*)'/, (questionnaire: string) => {
    mocker.set({
      Path: `/api/uacs/instrument/${questionnaire}`,
      Status: 500
    });
    // mocker.applyMocks();
  });
};


export const givenTheQuestionnaireHasATOStartDate = (given: DefineStepFunction, mocker: Mocker): void => {
  given(/'(.*)' has a TO start date of '(.*)'/, async (questionnaire: string, toStartDate: string) => {
    mocker.set({
      Path: `/api/tostartdate/${questionnaire}`,
      Status: 200,
      JSON: { tostartdate: formatDateString(toStartDate) }
    });
    // mocker.applyMocks();
  });
};


export const givenTheQuestionnaireHasNoTOStartDate = (given: DefineStepFunction, mocker: Mocker): void => {
  given(/'(.*)' has no TO start date/, async (questionnaire: string) => {
    mocker.set({
      Path: `/api/tostartdate/${questionnaire}`,
      Status: 404,
    });
    // mocker.applyMocks();
  });
};

export const givenAllInstallsWillFail = (given: DefineStepFunction, mocker: Mocker): void => {
  given(/All Questionnaire installs will fail for '(.*)'/, (questionnaire_matcher: string) => {
    mocker.set({
      Path: `/api/install?filename=${questionnaire_matcher}`,
      Status: 500,
    });
    // mocker.applyMocks();
  });
};

export const givenIHaveSelectedTheQuestionnairePacakgeToDeploy = (given: DefineStepFunction): void => {
  given(/I have selected the questionnaire package for '(.*)' to deploy/, async (questionnaire: string) => {
    await navigateToDeployPageAndSelectFile(questionnaire);
  });
};

export const givenTheQuestionnaireIsLive = (
  given: DefineStepFunction,
  instrumentList: Instrument[],
  mocker: Mocker
): void => {
  given(/'(.*)' is live/, (questionnaire: string) => {
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        console.log(questionnaire);
        instrument.hasData = true;
        instrument.active = true;

        mocker.set({
          Path: `/api/instruments/${questionnaire}`,
          Status: 200,
          JSON: instrument
        });
      }
    }
    // mocker.applyMocks();
  });
};

export const givenTheQuestionnaireIsInactive = (
  given: DefineStepFunction,
  instrumentList: Instrument[],
  mocker: Mocker
): void => {
  given(/'(.*)' is inactive/, (questionnaire: string) => {
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        console.log(questionnaire);
        instrument.status = "inactive";

        mocker.set({
          Path: `/api/instruments/${questionnaire}`,
          Status: 200,
          JSON: instrument
        });
      }
    }
    // mocker.applyMocks();
  });
};

export const givenTheQuestionnaireHasActiveSurveyDays = (
  given: DefineStepFunction,
  instrumentList: Instrument[],
  mocker: Mocker
): void => {
  given(/'(.*)' has active survey days/, (questionnaire: string) => {
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        console.log(questionnaire);
        instrument.active = true;

        mocker.set({
          Path: `/api/instruments/${questionnaire}`,
          Status: 200,
          JSON: instrument
        });
      }
    }
    // mocker.applyMocks();
  });
};

export const givenTheQuestionnareHasTheSettings = (given: DefineStepFunction, mocker: Mocker): void => {
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
    mocker.set({
      Path: `/api/instruments/${questionnaire}/settings`,
      Status: 200,
      JSON: settings
    });
    // mocker.applyMocks();
  });
};
