import { GroupedSummary, Panel, SummaryGroupTable } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
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

  const groupedSummary = new GroupedSummary([
    {
      title: "Donor cases",
      preamble: (
        <Panel>
          <p>
            To create initial donor cases for interviewers, click <b>Create cases</b>.
          </p>
          <p>
            If you add new interviewers who do not yet have donor cases, click <b>Create cases</b>{" "}
            again. Only interviewers without an existing donor case will receive one.
          </p>
        </Panel>
      ),
      records: Object.fromEntries(
        rolesToRender.map((role) => [
          role,
          {
            display: (
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
            ),
          },
        ]),
      ),
    },
  ]);

  return (
    <SummaryGroupTable
      className="ons-u-mb-m"
      groupedSummary={groupedSummary}
    />
  );
}

export { CreateDonorCases };
