type StepFn = (...args: unknown[]) => void | Promise<void>;

export type NativeStep = (name: string | RegExp, fn: (...args: never[]) => unknown) => void;

export type ScenarioArgs = {
  cases?: string;
  date?: string;
  deployErrorMessage?: string;
  installedQuestionnaires?: string[];
  message?: string;
  modes?: string;
  questionnaireName?: string;
  questionnaireTable?: Array<Record<string, string>>;
  searchValue?: string;
  selection?: "cancel" | "overwrite";
  settingsTable?: Array<Record<string, string>>;
  uacCount?: string;
};

type ScenarioDefinition = {
  args?: ScenarioArgs;
  name: string;
};

type ScenarioInput = string | ScenarioDefinition;

type ScenarioStep = {
  kind: "Given" | "When" | "Then";
  name: string | RegExp;
  fn: StepFn;
};

const DEFAULT_QUESTIONNAIRE = "OPN2004A";
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

function toLabel(stepName: string | RegExp): string {
  return typeof stepName === "string" ? stepName : stepName.toString();
}

type ResolveContext = {
  installedStepCalls: number;
};

type ResolvedScenarioArgs = {
  cases: string;
  date: string;
  deployErrorMessage: string;
  installedQuestionnaires: string[];
  message: string;
  modes: string;
  questionnaireName: string;
  questionnaireTable: Array<Record<string, string>>;
  searchValue: string;
  selection: "cancel" | "overwrite";
  settingsTable: Array<Record<string, string>>;
  uacCount: string;
};

function defaultScenarioArgs(): ScenarioArgs {
  return {
    cases: DEFAULT_CASE_COUNT,
    date: DEFAULT_DATE,
    deployErrorMessage: DEFAULT_DEPLOY_ERROR_MESSAGE,
    installedQuestionnaires: [DEFAULT_QUESTIONNAIRE],
    message: DEFAULT_MESSAGE,
    modes: DEFAULT_MODES,
    questionnaireName: DEFAULT_QUESTIONNAIRE,
    questionnaireTable: DEFAULT_QUESTIONNAIRE_TABLE,
    searchValue: DEFAULT_QUESTIONNAIRE,
    selection: "overwrite",
    settingsTable: DEFAULT_SETTINGS_TABLE,
    uacCount: DEFAULT_CASE_COUNT,
  };
}

function resolveScenarioArgs(defaults?: ScenarioArgs, overrides?: ScenarioArgs) {
  const inferredArgs = defaultScenarioArgs();
  const questionnaireName =
    overrides?.questionnaireName ??
    defaults?.questionnaireName ??
    inferredArgs.questionnaireName ??
    DEFAULT_QUESTIONNAIRE;
  const questionnaireTable = [{ Questionnaire: questionnaireName }];

  return {
    cases: overrides?.cases ?? defaults?.cases ?? inferredArgs.cases ?? DEFAULT_CASE_COUNT,
    date: overrides?.date ?? defaults?.date ?? inferredArgs.date ?? DEFAULT_DATE,
    deployErrorMessage:
      overrides?.deployErrorMessage ??
      defaults?.deployErrorMessage ??
      inferredArgs.deployErrorMessage ??
      DEFAULT_DEPLOY_ERROR_MESSAGE,
    installedQuestionnaires: overrides?.installedQuestionnaires ??
      defaults?.installedQuestionnaires ?? [questionnaireName],
    message: overrides?.message ?? defaults?.message ?? inferredArgs.message ?? DEFAULT_MESSAGE,
    modes: overrides?.modes ?? defaults?.modes ?? inferredArgs.modes ?? DEFAULT_MODES,
    questionnaireName,
    questionnaireTable:
      overrides?.questionnaireTable ?? defaults?.questionnaireTable ?? questionnaireTable,
    searchValue: overrides?.searchValue ?? defaults?.searchValue ?? questionnaireName,
    selection: overrides?.selection ?? defaults?.selection ?? inferredArgs.selection ?? "overwrite",
    settingsTable:
      overrides?.settingsTable ??
      defaults?.settingsTable ??
      inferredArgs.settingsTable ??
      DEFAULT_SETTINGS_TABLE,
    uacCount:
      overrides?.uacCount ?? defaults?.uacCount ?? inferredArgs.uacCount ?? DEFAULT_CASE_COUNT,
  } satisfies ResolvedScenarioArgs;
}

function formatStepArgs(args: unknown[]): string {
  if (args.length === 0) {
    return "";
  }

  const formattedArgs = args.map((arg) => {
    if (typeof arg === "string") {
      return JSON.stringify(arg);
    }

    const serialized = JSON.stringify(arg);

    return serialized ?? String(arg);
  });

  return ` (${formattedArgs.join(", ")})`;
}

function withStepContext(error: unknown, description: string): Error {
  if (error instanceof Error) {
    error.message = `${description}\n${error.message}`;

    return error;
  }

  return new Error(`${description}\n${String(error)}`);
}

function resolveArgs(
  stepName: string | RegExp,
  scenarioArgs: ResolvedScenarioArgs,
  ctx: ResolveContext,
  stepKind: "Given" | "When" | "Then",
): unknown[] {
  const label = toLabel(stepName).toLowerCase();
  const questionnaireName = scenarioArgs.questionnaireName;

  if (label.includes("is installed")) {
    const questionnaireNames = scenarioArgs.installedQuestionnaires;
    const questionnaireName =
      questionnaireNames[Math.min(ctx.installedStepCalls, questionnaireNames.length - 1)] ??
      questionnaireNames[questionnaireNames.length - 1];

    ctx.installedStepCalls += 1;

    return [questionnaireName];
  }

  if (label.includes("has the settings")) {
    return [questionnaireName, scenarioArgs.settingsTable];
  }

  if (label.includes("list of the deployed questionnaires")) {
    return [scenarioArgs.questionnaireTable];
  }

  if (label.includes("in the search box")) {
    return [scenarioArgs.searchValue];
  }

  if (label.includes("following message")) {
    return [scenarioArgs.message];
  }

  if (label.includes("information banner with an error message")) {
    return [scenarioArgs.deployErrorMessage];
  }

  if (label.includes("questionnaire details page for")) {
    return [questionnaireName];
  }

  if (label.includes("has the modes")) {
    return [questionnaireName, scenarioArgs.modes];
  }

  if (stepKind === "Then" && label.includes("questionnaire has") && label.includes("cases")) {
    return [scenarioArgs.cases];
  }

  if (stepKind === "Given" && label.includes("has") && label.includes("cases")) {
    return [questionnaireName, scenarioArgs.cases];
  }

  if (stepKind === "Given" && label.includes("has") && label.includes("unique access codes")) {
    return [questionnaireName, scenarioArgs.uacCount];
  }

  if (label.includes("i select to '(.*)'") || label.includes("i select to")) {
    return [scenarioArgs.selection];
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
    return [scenarioArgs.date];
  }

  if (
    (label.includes("telephone operations start date of") ||
      label.includes("totalmobile release date of")) &&
    label.includes("stored against")
  ) {
    return [scenarioArgs.date, questionnaireName];
  }

  if (
    label.includes("has a telephone operations start date of") ||
    label.includes("has a totalmobile release date of")
  ) {
    return [questionnaireName, scenarioArgs.date];
  }

  return [
    questionnaireName,
    scenarioArgs.date,
    scenarioArgs.modes,
    scenarioArgs.cases,
    scenarioArgs.settingsTable,
    scenarioArgs.message,
  ];
}

export function createScenario(defaultArgs?: ScenarioArgs) {
  return (
    input: ScenarioInput,
    defineSteps: (steps: { Given: NativeStep; When: NativeStep; Then: NativeStep }) => void,
  ): void => {
    const scenario = typeof input === "string" ? { name: input } : input;
    const scenarioArgs = resolveScenarioArgs(defaultArgs, scenario.args);

    describe.sequential(`Scenario: ${scenario.name}`, () => {
      const steps: ScenarioStep[] = [];

      const mkStep = (kind: "Given" | "When" | "Then"): NativeStep => {
        return (stepName, stepFn) => {
          steps.push({ kind, name: stepName, fn: stepFn as StepFn });
        };
      };

      defineSteps({ Given: mkStep("Given"), When: mkStep("When"), Then: mkStep("Then") });

      test(`Scenario: ${scenario.name}`, { timeout: 20000 }, async () => {
        const resolveContext: ResolveContext = { installedStepCalls: 0 };

        for (const step of steps) {
          const args = resolveArgs(step.name, scenarioArgs, resolveContext, step.kind);
          const description = `${step.kind} ${toLabel(step.name)}${formatStepArgs(args)}`;

          try {
            await step.fn(...args);
          } catch (error) {
            throw withStepContext(error, description);
          }
        }
      });
    });
  };
}
