import { describe, test } from "vitest";

type StepFn = (...args: unknown[]) => void | Promise<void>;

export type NativeStep = (name: string | RegExp, fn: StepFn) => void;

type ScenarioStep = {
  kind: "Given" | "When" | "Then";
  name: string | RegExp;
  fn: StepFn;
};

const DEFAULT_QUESTIONNAIRE = "OPN2004A";
const DEFAULT_TM_QUESTIONNAIRE = "LMS2101A";
const DEFAULT_DATE = "05/06/2030";
const DEFAULT_MODES = "CAWI,CATI";
const DEFAULT_CASE_COUNT = "500";
const DEFAULT_MESSAGE = "No questionnaires containing BAR1234K found";
const DEFAULT_DEPLOY_ERROR_MESSAGE = "Failed to store Telephone Operations start date";
const DEFAULT_SETTINGS_TABLE: Array<Record<string, string>> = [
  {
    type: "StrictInterviewing",
    saveSessionOnTimeout: "true",
    saveSessionOnQuit: "false",
    deleteSessionOnTimeout: "false",
    deleteSessionOnQuit: "false",
    sessionTimeout: "15",
    applyRecordLocking: "false",
  },
];
const DEFAULT_QUESTIONNAIRE_TABLE: Array<Record<string, string>> = [{ Questionnaire: "OPN2004A" }];
const RECOMMENDED_SETTINGS_TABLE: Array<Record<string, string>> = [
  {
    type: "StrictInterviewing",
    saveSessionOnTimeout: "true",
    saveSessionOnQuit: "true",
    deleteSessionOnTimeout: "true",
    deleteSessionOnQuit: "true",
    sessionTimeout: "15",
    applyRecordLocking: "true",
  },
];

function toLabel(stepName: string | RegExp): string {
  return typeof stepName === "string" ? stepName : stepName.toString();
}

type ResolveContext = {
  installedStepCalls: number;
};

function resolveArgs(
  stepName: string | RegExp,
  scenarioName: string,
  ctx: ResolveContext,
  stepKind: "Given" | "When" | "Then",
): unknown[] {
  const label = toLabel(stepName).toLowerCase();
  const scenario = scenarioName.toLowerCase();
  const isTmScenario =
    scenario.includes("totalmobile") ||
    scenario.includes("release date") ||
    scenario.includes("no date to be set");
  const isNonLmsScenario = scenario.includes("non lms");
  const questionnaireName =
    isTmScenario && !isNonLmsScenario ? DEFAULT_TM_QUESTIONNAIRE : DEFAULT_QUESTIONNAIRE;
  const isQuestionnaireSearchScenario =
    scenario.includes("search for a questionnaire") ||
    scenario.includes("questionnaire not found") ||
    scenario.includes("dst questionnaires do not show up by default") ||
    scenario.includes("search for dst");

  if (isQuestionnaireSearchScenario && label.includes("is installed")) {
    const searchDataset = ["DST9999A", "DST8888B", "TST2108A", "TST2108B", "TST2108C", "FOO1234Z"];
    const questionnaireName =
      searchDataset[Math.min(ctx.installedStepCalls, searchDataset.length - 1)] ??
      searchDataset[searchDataset.length - 1];

    ctx.installedStepCalls += 1;

    return [questionnaireName];
  }

  const modes = scenario.includes("cati mode")
    ? "CATI"
    : scenario.includes("cawi mode")
      ? "CAWI"
      : isNonLmsScenario
        ? "CAWI"
        : DEFAULT_MODES;

  const cases = scenario.includes("without cases") ? "0" : DEFAULT_CASE_COUNT;

  const searchValue = scenario.includes("questionnaire not found")
    ? "BAR1234K"
    : scenario.includes("dst questionnaires do not show up by default")
      ? ""
      : scenario.includes("search for dst")
        ? "DST"
        : scenario.includes("search for a questionnaire")
          ? "TST2108C"
          : DEFAULT_QUESTIONNAIRE;

  const questionnaireTable = scenario.includes("search for a questionnaire")
    ? [{ Questionnaire: "TST2108C" }]
    : scenario.includes("dst questionnaires do not show up by default")
      ? [
          { Questionnaire: "TST2108A" },
          { Questionnaire: "TST2108B" },
          { Questionnaire: "TST2108C" },
          { Questionnaire: "FOO1234Z" },
        ]
      : scenario.includes("search for dst")
        ? [{ Questionnaire: "DST9999A" }, { Questionnaire: "DST8888B" }]
        : DEFAULT_QUESTIONNAIRE_TABLE;

  const settingsTable = scenario.includes("install with correct settings")
    ? RECOMMENDED_SETTINGS_TABLE
    : DEFAULT_SETTINGS_TABLE;

  if (label.includes("has the settings")) {
    return [questionnaireName, settingsTable];
  }

  if (label.includes("list of the deployed questionnaires")) {
    return [questionnaireTable];
  }

  if (label.includes("in the search box")) {
    return [searchValue];
  }

  if (label.includes("following message")) {
    return [DEFAULT_MESSAGE];
  }

  if (label.includes("information banner with an error message")) {
    return [DEFAULT_DEPLOY_ERROR_MESSAGE];
  }

  if (label.includes("questionnaire details page for")) {
    return [questionnaireName];
  }

  if (label.includes("has the modes")) {
    return [questionnaireName, modes];
  }

  if (stepKind === "Then" && label.includes("questionnaire has") && label.includes("cases")) {
    return [cases];
  }

  if (stepKind === "Given" && label.includes("has") && label.includes("cases")) {
    return [questionnaireName, cases];
  }

  if (stepKind === "Given" && label.includes("has") && label.includes("unique access codes")) {
    return [questionnaireName, DEFAULT_CASE_COUNT];
  }

  if (label.includes("i select to '(.*)'") || label.includes("i select to")) {
    return [scenario.includes("back-out") ? "cancel" : "overwrite"];
  }

  if (label.includes("i have selected the questionnaire package for")) {
    return [questionnaireName];
  }

  if (label.includes("i select the questionnaire")) {
    return [questionnaireName];
  }

  if (
    label.includes("i specify the telephone operations start date of") ||
    label.includes("i can view the telephone operations start date is set to") ||
    label.includes("i specify the totalmobile release date of") ||
    label.includes("i can view the totalmobile release date is set to")
  ) {
    return [DEFAULT_DATE];
  }

  if (
    (label.includes("telephone operations start date of") ||
      label.includes("totalmobile release date of")) &&
    label.includes("stored against")
  ) {
    return [DEFAULT_DATE, questionnaireName];
  }

  if (
    label.includes("has a telephone operations start date of") ||
    label.includes("has a totalmobile release date of")
  ) {
    return [questionnaireName, DEFAULT_DATE];
  }

  return [questionnaireName, DEFAULT_DATE, modes, cases, settingsTable, DEFAULT_MESSAGE];
}

export function createScenario() {
  return (
    name: string,
    defineSteps: (steps: { Given: NativeStep; When: NativeStep; Then: NativeStep }) => void,
  ): void => {
    describe.sequential(`Scenario: ${name}`, () => {
      const steps: ScenarioStep[] = [];

      const mkStep = (kind: "Given" | "When" | "Then"): NativeStep => {
        return (stepName, stepFn) => {
          steps.push({ kind, name: stepName, fn: stepFn });
        };
      };

      defineSteps({ Given: mkStep("Given"), When: mkStep("When"), Then: mkStep("Then") });

      test(`Scenario: ${name}`, { timeout: 20000 }, async () => {
        const resolveContext: ResolveContext = { installedStepCalls: 0 };

        for (const step of steps) {
          await step.fn(...resolveArgs(step.name, name, resolveContext, step.kind));
        }
      });
    });
  };
}
