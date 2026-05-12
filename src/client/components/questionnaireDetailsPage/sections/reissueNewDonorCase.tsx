import { Button, Panel } from "blaise-design-system-react-components";
import React, { type ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FindUser } from "./findUser";

import type { Questionnaire } from "blaise-api-node-client";

interface Props {
  questionnaire: Questionnaire;
}

function ReissueNewDonorCase({ questionnaire }: Props): ReactElement {
  const [user, setUser] = useState("");
  const [error, setError] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const roles: string[] = ["IPS Field Interviewer", "IPS Manager", "IPS Pilot Interviewer"];

  function onSetUser(user: string) {
    setUser(user);
    if (user.trim().length > 0) {
      setError(false);
      setErrorMessage("");
    } else {
      setError(true);
    }
  }

  function onError(message: string) {
    setErrorMessage(message);
    setError(true);
  }

  function reissueNewDonorCaseButtonClicked() {
    const trimmedUser = user.trim();

    setUser(trimmedUser);

    if (trimmedUser === "") {
      setErrorMessage("User input cannot be empty or contain only spaces");
      setError(true);
    } else {
      setError(false);
      setErrorMessage("");
      navigate(
        `/questionnaire/${questionnaire.name}/reissue-new-donor-case/${encodeURIComponent(trimmedUser)}`,
        {
          state: {
            section: "reissueNewDonorCase",
            questionnaire: questionnaire,
            user: trimmedUser,
          },
        },
      );
    }
  }

  return (
    <>
      <div className="ons-summary ons-u-mb-m">
        <div className="ons-summary__group">
          <Panel>
            To assign another donor case to an interviewer who already has one, select their
            username and click <b>Reissue Donor Case</b>.
          </Panel>
          <dl className="ons-summary__items">
            <div className="ons-summary__item">
              <dt className="ons-summary__item-title">
                <div className="ons-summary__item--text">
                  <div className="ons-field">
                    <FindUser
                      label="Enter Username"
                      onItemSelected={onSetUser}
                      onError={onError}
                      roles={roles}
                    />
                  </div>
                  <div className="ons-field ons-input--text">
                    {errorMessage && (
                      <Panel status="error">
                        <p className="">{errorMessage}</p>
                      </Panel>
                    )}
                  </div>
                </div>
                <div className="ons-u-mt-m ons-u-mb-s">
                  <Button
                    label="Reissue Donor Case"
                    primary={false}
                    small={true}
                    disabled={error}
                    onClick={reissueNewDonorCaseButtonClicked}
                  />
                </div>
              </dt>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}

export { ReissueNewDonorCase };
