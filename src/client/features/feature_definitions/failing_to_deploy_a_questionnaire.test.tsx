import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenAllInstallsWillFail,
  givenIHaveSelectedTheQuestionnairePackageToDeploy,
} from "../step_definitions/given";
import { thenICanRetryAnInstall, thenIGetAnErrorBanner } from "../step_definitions/then";
import { whenIConfirmMySelection, whenIDeploy } from "../step_definitions/when";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature("./src/client/features/failing_to_deploy_a_questionnaire.feature", {
  tagFilter: "not @server and not @integration",
});

const mocker = new MockAdapter(axios);

defineFeature(feature, (test) => {
  afterEach(() => {
    mocker.reset();
  });

  test("Deployment of selected file failure", ({ given, when, then }) => {
    givenAllInstallsWillFail(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

    whenIConfirmMySelection(when);
    whenIDeploy(when);

    thenIGetAnErrorBanner(then);
  });

  test("Deploy selected file, retry following failure", ({ given, when, then }) => {
    givenAllInstallsWillFail(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

    whenIConfirmMySelection(when);
    whenIDeploy(when);

    thenIGetAnErrorBanner(then);
    thenICanRetryAnInstall(then);
  });
});
