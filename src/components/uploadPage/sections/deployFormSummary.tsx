import type { Questionnaire } from "blaise-api-node-client";
import dateFormatter from "dayjs";
import { type FormikContextType, useFormikContext } from "formik";
import React, { type ReactElement } from "react";

import { roundUp } from "../../../utilities/maths";
import { totalmobileReleaseDateSurveyTLAs } from "../../../utilities/totalmobileReleaseDateSurveyTLAs";

interface PageFourProps {
  file: File | undefined;
  foundQuestionnaire: Questionnaire | null;
}

type DeployFormValues = {
  "set start date"?: string;
  "set release date"?: string;
};

function DeployFormSummary({ file, foundQuestionnaire }: PageFourProps): ReactElement {
  const { values: formValues }: FormikContextType<DeployFormValues> = useFormikContext();

  return (
    <>
      <div className="ons-summary">
        <div className="ons-summary__group">
          <h1 className="ons-summary__group-title">Deployment summary</h1>
          <table className="ons-summary__items">
            <thead className="ons-u-vh">
              <tr>
                <th>Question</th>
                <th>Answer given</th>
              </tr>
            </thead>

            <tbody className="ons-summary__item">
              <tr className="ons-summary__row ons-summary__row--has-values">
                <td className="ons-summary__item-title">
                  <div className="ons-summary__item--text">Questionnaire file name</div>
                </td>
                <td className="ons-summary__values">{file?.name}</td>
              </tr>
            </tbody>
            <tbody className="ons-summary__item">
              <tr className="ons-summary__row ons-summary__row--has-values">
                <td className="ons-summary__item-title">
                  <div className="ons-summary__item--ons-text">
                    Questionnaire file last modified date
                  </div>
                </td>
                <td className="ons-summary__values">
                  {dateFormatter(file?.lastModified).format("DD/MM/YYYY HH:mm")}
                </td>
              </tr>
            </tbody>
            <tbody className="ons-summary__item">
              <tr className="ons-summary__row ons-summary__row--has-values">
                <td className="ons-summary__item-title">
                  <div className="ons-summary__item--text">Questionnaire file size</div>
                </td>
                <td className="ons-summary__values">{file && roundUp(file.size / 1000000, 0)}MB</td>
              </tr>
            </tbody>
            <tbody className="ons-summary__item">
              <tr className="ons-summary__row ons-summary__row--has-values">
                <td className="ons-summary__item-title">
                  <div className="ons-summary__item--text">
                    Does the questionnaire already exist in blaise?
                  </div>
                </td>
                <td className="ons-summary__values">
                  {foundQuestionnaire ? "Yes, overriding questionnaire" : "No"}
                </td>
              </tr>
            </tbody>
            <tbody className="ons-summary__item">
              <tr className="ons-summary__row ons-summary__row--has-values">
                <td className="ons-summary__item-title">
                  <div className="ons-summary__item--text">
                    Set a telephone operations start date for questionnaire?
                  </div>
                </td>
                <td className="ons-summary__values">
                  {formValues["set start date"]
                    ? `Start date set to ${dateFormatter(formValues["set start date"]).format("DD/MM/YYYY")}`
                    : "Start date not specified"}
                </td>
              </tr>
            </tbody>
            {totalmobileReleaseDateSurveyTLAs.some((tla) => file?.name.startsWith(tla)) && (
              <tbody className="ons-summary__item">
                <tr className="ons-summary__row ons-summary__row--has-values">
                  <td className="ons-summary__item-title">
                    <div className="ons-summary__item--text">
                      Set a totalmobile release date for questionnaire?
                    </div>
                  </td>
                  <td className="ons-summary__values">
                    {formValues["set release date"]
                      ? `Release date set to ${dateFormatter(formValues["set release date"]).format("DD/MM/YYYY")}`
                      : "Release date not specified"}
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </>
  );
}

export default DeployFormSummary;
