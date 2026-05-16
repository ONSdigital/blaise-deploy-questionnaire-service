import { LoadingPanel, Panel } from "blaise-design-system-react-components";
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
  const items: ReactElement[] = [];

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

    items.push(
      <div
        className="ons-summary__item"
        key={settingName}
      >
        <dt className="ons-summary__item-title">
          <div className="ons-summary__item--text">{settingName}</div>
        </dt>
        <dd className="ons-summary__values">
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
        </dd>
      </div>,
    );
  }

  return (
    <div className="ons-summary">
      <div className="ons-summary__group">
        <h2 className="ons-summary__group-title">Questionnaire settings</h2>
        <dl
          id="report-table"
          className="ons-summary__items"
        >
          {items}
        </dl>
      </div>
    </div>
  );
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
    return <LoadingPanel message={"Getting questionnaire settings"} />;
  }

  return formatSettings(questionnaireSettings, invalidSettings);
}
