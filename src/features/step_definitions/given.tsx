import navigateToDeployPageAndSelectFile, { format_date_string, mock_fetch_requests } from "./helpers/functions";
import { DefineStepFunction } from "jest-cucumber";
import { Instrument } from "../../../Interfaces";
import { instrumentWithName } from "./helpers/API_Mock_Objects";

export const givenTheQuestionnaireIsInstalled = (
  given: DefineStepFunction,
  instrumentList: Instrument[],
  mockList: Record<string, Promise<any>>
): void => {
  given(/the questionnaire '(.*)' is installed/, (questionnaire: string) => {
    if (!instrumentList.some(instrument => instrument.name === questionnaire)) {
      instrumentList.push(instrumentWithName(questionnaire));
    }
    mockList["/api/instruments"] = Promise.resolve({
      status: 200,
      json: () => Promise.resolve(instrumentList),
    });
    mockList[`/api/instruments/${questionnaire}`] = Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ name: questionnaire, active: true }),
    });
    mockList[`/api/instruments/${questionnaire}:DELETE`] = Promise.resolve({
      status: 204,
      json: () => Promise.resolve({}),
    });
    mockList[`/api/tostartdate/${questionnaire}`] = Promise.resolve({
      status: 204,
      json: () => Promise.resolve({}),
    });
    mockList[`/api/tostartdate/${questionnaire}:POST`] = Promise.resolve({
      status: 200,
      json: () => Promise.resolve({}),
    });
  });
};

export const givenTheQuestionnaireHasModes = (
  given: DefineStepFunction,
  mockList: Record<string, Promise<any>>
): void => {
  given(/'(.*)' has the modes '(.*)'/, (questionnaire: string, modes: string) => {
    mockList[`/api/instruments/${questionnaire}/modes`] = Promise.resolve({
      status: 200,
      json: () => Promise.resolve(modes.split(",")),
    });
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
  mockList: Record<string, Promise<any>>
): void => {
  given(/'(.*)' has (\d+) UACs/, (questionnaire: string, cases: string) => {
    const caseCount: number = +cases;
    mockList[`/api/uacs/instrument/${questionnaire}/count`] = Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ count: caseCount }),
    });
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
  mockList: Record<string, Promise<any>>
): void => {
  given(/'(.*)' cannot be deleted because it would go erroneous/, (questionnaire: string) => {
    mockList[`/api/instruments/${questionnaire}:DELETE`] = Promise.resolve({
      status: 420,
      json: () => Promise.resolve({}),
    });
    mockList[`/api/instruments/${questionnaire}`] = Promise.resolve({
      status: 420,
      json: () => Promise.resolve({}),
    });
  });
};

export const givenUACGenerationIsBroken = (given: DefineStepFunction, mockList: Record<string, Promise<any>>): void => {
  given(/UAC generation is broken for '(.*)'/, (questionnaire: string) => {
    mockList[` /api/uacs/instrument/${questionnaire}`] = Promise.resolve({
      status: 500,
      json: () => Promise.resolve(),
    });
  });
};


export const givenTheQuestionnaireHasATOStartDate = (given: DefineStepFunction, mockList: Record<string, Promise<any>>): void => {
  given(/'(.*)' has a TO start date of '(.*)'/, async (questionnaire: string, toStartDate: string) => {
    mockList[`/api/tostartdate/${questionnaire}`] = Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ tostartdate: format_date_string(toStartDate) }),
    });
  });
};


export const givenTheQuestionnaireHasNoTOStartDate = (given: DefineStepFunction, mockList: Record<string, Promise<any>>): void => {
  given(/'(.*)' has no TO start date/, async (questionnaire: string) => {
    mockList[`/api/tostartdate/${questionnaire}`] = Promise.resolve({
      status: 404,
      json: () => Promise.resolve({}),
    });
  });
};

export const givenAllInstallsWillFail = (given: DefineStepFunction, mockList: Record<string, Promise<any>>): void => {
  given("All Questionnaire installs will fail", () => {
    mockList["/api/install"] = Promise.resolve({
      status: 500,
      json: () => Promise.resolve({}),
    });
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
): void => {
  given(/'(.*)' is live/, (questionnaire: string) => {
    for (const instrument of instrumentList) {
      if (instrument.name === questionnaire) {
        instrument.hasData = true;
        instrument.active = true;
      }
    }
  });
};
