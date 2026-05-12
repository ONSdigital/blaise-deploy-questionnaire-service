import { Panel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";
import { Link } from "react-router-dom";

import type { Questionnaire } from "blaise-api-node-client";

interface Props {
  questionnaire: Questionnaire;
}

const VALID_IPS_ROLES = ["IPS Manager", "IPS Field Interviewer", "IPS Pilot Interviewer"];

function CreateDonorCases({ questionnaire }: Props): ReactElement {
  const ipsPilotQuestionnairePattern = /^IPS\d{4}_PILOT$/i;
  const isIPSPilotQuestionnaire = ipsPilotQuestionnairePattern.test(questionnaire.name);

  const rolesToRender = isIPSPilotQuestionnaire
    ? ["IPS Pilot Interviewer"]
    : VALID_IPS_ROLES.filter((role) => role !== "IPS Pilot Interviewer");

  return (
    <>
      <div className="ons-summary ons-u-mb-m">
        <div className="ons-summary__group">
          <h2 className="ons-summary__group-title">Donor case</h2>
          <Panel>
            To create initial donor cases for interviewers, click <b>Create cases</b>.
            <br />
            <br />
            If you add new interviewers who do not yet have donor cases, click <b>
              Create cases
            </b>{" "}
            again. Only interviewers without an existing case will receive one.
            <br />
          </Panel>
          <dl className="ons-summary__items">
            {rolesToRender.map((role) => (
              <div
                key={role}
                className="ons-summary__item"
              >
                <dt className="ons-summary__item-title">
                  <div className="ons-summary__item--text">{role}</div>
                </dt>
                <dd className="ons-summary__values">
                  <Link
                    to={`/questionnaire/${questionnaire.name}/create-donor-cases/${encodeURIComponent(role)}`}
                    state={{
                      section: "createDonorCases",
                      questionnaire: questionnaire,
                      role: role,
                    }}
                    className="ons-summary__button"
                    style={{ fontWeight: "normal" }}
                    aria-label={`Create donor cases for questionnaire ${questionnaire.name}`}
                  >
                    Create cases
                  </Link>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </>
  );
}

export { CreateDonorCases };
