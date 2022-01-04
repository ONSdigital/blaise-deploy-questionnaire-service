import navigateToDeployPageAndSelectFile, { mock_fetch_requests } from "./helpers/functions";
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
