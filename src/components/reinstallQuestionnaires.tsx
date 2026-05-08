import type { Questionnaire } from "blaise-api-node-client";
import { Button, ErrorBoundary, LoadingPanel, Panel } from "blaise-design-system-react-components";
import React, { Fragment, type ReactElement, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { verifyAndInstallQuestionnaire } from "../client/componentProcesses";
import { clientLogger } from "../client/logger";
import { getQuestionnaires } from "../client/questionnaires";
import { getAllQuestionnairesInBucket } from "../client/upload";

import Breadcrumbs from "./breadcrumbs";

function ReinstallQuestionnaires(): ReactElement {
  const [questionnaireList, setQuestionnaireList] = useState<string[]>([]);
  const [listError, setListError] = useState<string>("Loading ...");
  const [listWarning, setListWarning] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [questionnaireToInstall, setQuestionnaireToInstall] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [installing, setInstalling] = useState<boolean>(false);
  const navigate = useNavigate();

  const getInstalledQuestionnaireList = useCallback(async () => {
    let questionnaires: Questionnaire[];

    try {
      questionnaires = await getQuestionnaires();
      clientLogger.info(
        `Response from get all questionnaires successful, data list length ${questionnaireList.length}`,
      );
      clientLogger.info(questionnaires);
    } catch {
      clientLogger.info(
        `Response from get all questionnaires failed, data list length ${questionnaireList.length}`,
      );
      setListWarning(
        "Unable to load currently installed questionnaires from Blaise. Showing all available questionnaires from bucket.",
      );

      return [];
    }

    const list: string[] = [];

    for (const questionnaire of questionnaires) {
      list.push(`${questionnaire.name}.bpkg`);
    }

    return list;
  }, [questionnaireList.length]);

  const getQuestionnairesToReinstall = useCallback(async () => {
    setLoading(true);
    clientLogger.info("getQuestionnairesToReinstall");
    const list: string[] = [];

    setListError("");
    setListWarning("");

    let bucketQuestionnaireList: string[];

    try {
      bucketQuestionnaireList = await getAllQuestionnairesInBucket();
      clientLogger.info(
        `Response from get all questionnaires in bucket successful, data list length ${bucketQuestionnaireList.length}`,
      );
    } catch {
      clientLogger.info("Response from get all questionnaires in bucket failed");
      setListError(
        "Unable to load questionnaires from bucket. Check local gcloud application-default auth and bucket permissions.",
      );
      setLoading(false);

      return;
    }

    const installedQuestionnaireList = await getInstalledQuestionnaireList();

    for (const questionnaire of bucketQuestionnaireList) {
      if (!installedQuestionnaireList.includes(questionnaire)) {
        list.push(questionnaire);
      }
    }

    if (list.length === 0) {
      setListError("No compatible previously installed questionnaires found.");
    }

    setQuestionnaireList(list);
    setLoading(false);
  }, [getInstalledQuestionnaireList]);

  useEffect(() => {
    getQuestionnairesToReinstall().then();
  }, [getQuestionnairesToReinstall]);

  async function installQuestionnaireFromBucket() {
    setInstalling(true);

    const [installed, message] = await verifyAndInstallQuestionnaire(questionnaireToInstall);
    const nextUploadStatus = installed ? "" : message;

    if (!installed) {
      setUploadStatus(nextUploadStatus);
    }

    setInstalling(false);

    navigate("/UploadSummary", {
      state: {
        questionnaireName: questionnaireToInstall.replace(/\.[a-zA-Z]*$/, ""),
        status: nextUploadStatus,
      },
    });
  }

  return (
    <>
      <Breadcrumbs
        breadcrumbList={[
          { link: "/", title: "Home" },
          { link: "/upload", title: "Deploy a questionnaire" },
        ]}
      />

      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        <h1 className="ons-u-mb-l">Reinstall questionnaire</h1>
        <p>
          Reinstall a previously uploaded questionnaire.
          <br />
          This will always deploy the last uploaded version of the questionnaire.
        </p>
        {loading ? (
          <LoadingPanel />
        ) : (
          <div className={"elementToFadeIn"}>
            <ErrorBoundary errorMessageText={"Failed to Unable to load questionnaires."}>
              <form>
                {listError !== "" ? (
                  <Panel spacious={true}>{listError}</Panel>
                ) : (
                  <>
                    {listWarning !== "" && <Panel spacious={true}>{listWarning}</Panel>}
                    <fieldset className="ons-fieldset">
                      <legend className="ons-fieldset__legend">
                        Select a questionnaire to install
                      </legend>
                      <div className="ons-radios__items">
                        {questionnaireList.map((item: string) => {
                          return (
                            <Fragment key={item}>
                              <p className="ons-radios__item">
                                <span className="ons-radio">
                                  <input
                                    type="radio"
                                    id={`install-${item}`}
                                    className="ons-radio__input ons-js-radio "
                                    value={item}
                                    name="select-survey"
                                    aria-label="No"
                                    onChange={() => setQuestionnaireToInstall(item)}
                                  />
                                  <label
                                    className="ons-radio__label "
                                    htmlFor={`install-${item}`}
                                  >
                                    {item}
                                  </label>
                                </span>
                              </p>
                              <br />
                            </Fragment>
                          );
                        })}
                      </div>
                    </fieldset>
                    <br />

                    <Button
                      label={"Install selected questionnaire"}
                      primary={true}
                      disabled={questionnaireToInstall === ""}
                      loading={installing}
                      id="confirm-install"
                      onClick={() => installQuestionnaireFromBucket()}
                    />
                  </>
                )}
              </form>
            </ErrorBoundary>
          </div>
        )}
      </main>
    </>
  );
}

export default ReinstallQuestionnaires;
