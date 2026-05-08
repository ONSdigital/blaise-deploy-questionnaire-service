import type { QuestionnaireSettings } from "blaise-api-node-client";
import { LoadingPanel, Panel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";

import { formatText } from "../../../utilities/textFormatting/textFormatting";

type QuestionnaireSettingsProps = {
  questionnaireSettings: QuestionnaireSettings | undefined;
  invalidSettings: Partial<QuestionnaireSettings>;
  errored: boolean;
};

function formatSetting(
  property: string,
  value: unknown,
  invalid: boolean,
  correctValue: unknown,
): ReactElement {
  return (
    <tbody
      className={`ons-summary__item ${invalid ? "ons-summary__item--error" : ""}`}
      key={property}
    >
      {invalid && (
        <tr className="ons-summary__row">
          <th
            colSpan={3}
            className="ons-summary__row-title ons-u-fs-r"
          >
            {formatText(property)} should be{" "}
            {typeof correctValue === "boolean"
              ? correctValue
                ? "True"
                : "False"
              : String(correctValue)}
          </th>
        </tr>
      )}
      <tr className="ons-summary__row ons-summary__row--has-values">
        <td className="ons-summary__item-title">
          <div className="ons-summary__item--text">{formatText(property)}</div>
        </td>
        <td
          className="ons-summary__values"
          colSpan={2}
        >
          {typeof value === "boolean" ? (value ? "True" : "False") : String(value)}
        </td>
      </tr>
    </tbody>
  );
}

function formatSettings(
  questionnaireSettings: QuestionnaireSettings,
  invalidSettings: Partial<QuestionnaireSettings>,
): ReactElement {
  const newElements: ReactElement[] = [];

  for (const [property, value] of Object.entries(questionnaireSettings)) {
    let invalid = false;
    let correctValue: unknown;

    if (property in invalidSettings) {
      invalid = true;
      correctValue = invalidSettings[property as keyof QuestionnaireSettings];
    }

    newElements.push(formatSetting(property, value, invalid, correctValue));
  }

  return (
    <div className="ons-summary">
      <div className="ons-summary__group">
        <h2>Questionnaire settings</h2>
        <table
          id="report-table"
          className="ons-summary__items ons-u-mt-s"
        >
          {newElements.map((element) => {
            return element;
          })}
        </table>
      </div>
    </div>
  );
}

export default function QuestionnaireSettingsTable({
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
