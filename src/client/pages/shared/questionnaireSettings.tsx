import {
  GroupedSummary,
  LoadingPanel,
  Panel,
  SummaryGroupTable,
} from "blaise-design-system-react-components";
import { type ReactElement } from "react";

import { formatText } from "../../utils/textFormatting";

import type { QuestionnaireSettings } from "blaise-api-node-client";

type QuestionnaireSettingsProps = {
  questionnaireSettings: QuestionnaireSettings | undefined;
  invalidSettings: Partial<QuestionnaireSettings>;
  errored: boolean;
};

function formatSetting(value: unknown): string {
  return typeof value === "boolean" ? (value ? "True" : "False") : String(value);
}

function formatSettings(
  questionnaireSettings: QuestionnaireSettings,
  invalidSettings: Partial<QuestionnaireSettings>,
): ReactElement {
  const records: Record<string, { display: ReactElement; csv: string }> = {};

  for (const [property, value] of Object.entries(questionnaireSettings)) {
    const settingName = formatText(property);
    const displayValue = formatSetting(value);
    let expectedValue: string | undefined;

    if (property in invalidSettings) {
      const correctValue = invalidSettings[property as keyof QuestionnaireSettings];

      expectedValue =
        typeof correctValue === "boolean"
          ? correctValue
            ? "True"
            : "False"
          : String(correctValue);
    }

    records[settingName] = {
      display: (
        <>
          <span
            className={
              expectedValue ? "ons-summary__text ons-u-mb-s" : "ons-summary__text ons-u-mb-no"
            }
          >
            {displayValue}
          </span>
          {expectedValue && (
            <Panel status="warn">
              <p className="ons-u-mb-no">
                {settingName} should be {expectedValue}
              </p>
            </Panel>
          )}
        </>
      ),
      csv: displayValue,
    };
  }

  const groupedSummary = new GroupedSummary([
    {
      title: "Questionnaire settings",
      rowsId: "report-table",
      records,
    },
  ]);

  return <SummaryGroupTable groupedSummary={groupedSummary} />;
}

export function QuestionnaireSettings({
  questionnaireSettings,
  invalidSettings,
  errored,
}: QuestionnaireSettingsProps): ReactElement {
  if (errored) {
    return (
      <>
        <Panel status={"error"}>
          <p>Failed to get questionnaire settings</p>
        </Panel>
      </>
    );
  }

  if (!questionnaireSettings) {
    return <LoadingPanel message={"Getting questionnaire settings..."} />;
  }

  return formatSettings(questionnaireSettings, invalidSettings);
}
