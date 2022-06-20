import React, { Fragment, ReactElement, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { getAllQuestionnairesInBucket } from "../client/upload";
import { getQuestionnaires } from "../client/questionnaires";

import { ErrorBoundary, ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { verifyAndInstallQuestionnaire } from "../client/componentProcesses";
import Breadcrumbs from "./breadcrumbs";
import { Questionnaire } from "blaise-api-node-client";

function ReinstallQuestionnaires(): ReactElement {
    const [questionnaireList, setQuestionnaireList] = useState<string[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [questionnaireToInstall, setQuestionnaireToInstall] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [installing, setInstalling] = useState<boolean>(false);
    const history = useHistory();

    useEffect(() => {
        getQuestionnairesToReinstall().then();
    }, []);

    async function getInstalledQuestionnaireList() {
        let questionnaires: Questionnaire[];
        try {
            questionnaires = await getQuestionnaires();
            console.log(`Response from get all questionnaires successful, data list length ${questionnaireList.length}`);
            console.log(questionnaires);
        } catch (error: unknown) {
            console.log(`Response from get all questionnaires failed, data list length ${questionnaireList.length}`);
            setListError("Unable to load questionnaires");
            setLoading(false);
            return [];
        }

        const list: string[] = [];
        for (const questionnaire of questionnaires) {
            list.push(`${questionnaire.name}.bpkg`);
        }

        return list;
    }

    async function getQuestionnairesToReinstall() {
        setLoading(true);
        console.log("getQuestionnairesToReinstall");
        const list: string[] = [];
        setListError("");

        let bucketQuestionnaireList: string[];
        try {
            bucketQuestionnaireList = await getAllQuestionnairesInBucket();
            console.log(`Response from get all questionnaires in bucket successful, data list length ${bucketQuestionnaireList.length}`);
        } catch {
            console.log("Response from get all questionnaires in bucket failed");
            setListError("Unable to load questionnaires.");
            setLoading(false);
            return;
        }

        const installedQuestionnaireList = await getInstalledQuestionnaireList();

        bucketQuestionnaireList.map((questionnaire: string) => {
            if (!installedQuestionnaireList.includes(questionnaire)) {
                list.push(questionnaire);
            }
        });

        if (list.length === 0) {
            setListError("No compatible previously installed questionnaires found.");
        }

        setQuestionnaireList(list);
        setLoading(false);
    }

    async function installQuestionnaireFromBucket() {
        setInstalling(true);

        const [installed, message] = await verifyAndInstallQuestionnaire(questionnaireToInstall);
        if (!installed) {
            setUploadStatus(message);
        }

        history.push("/UploadSummary",
            { questionnaireName: questionnaireToInstall.replace(/\.[a-zA-Z]*$/, ""), status: uploadStatus }
        );
    }


    function DisplayQuestionnairesToInstallList(): ReactElement {
        return (
            <div className={"elementToFadeIn"}>
                <ErrorBoundary errorMessageText={"Failed to Unable to load questionnaires."}>
                    <form>
                        {
                            listError !== "" ?
                                <ONSPanel spacious={true}>{listError}</ONSPanel>
                                :
                                <>
                                    <fieldset className="fieldset">
                                        <legend className="fieldset__legend">
                                            Select a questionnaire to install
                                        </legend>
                                        <div className="radios__items">
                                            {
                                                questionnaireList.map((item: string) => {
                                                    return (
                                                        <Fragment key={item}>
                                                            <p className="radios__item">
                                                                <span className="radio">
                                                                    <input
                                                                        type="radio"
                                                                        id={`install-${item}`}
                                                                        className="radio__input js-radio "
                                                                        value={item}
                                                                        name="select-survey"
                                                                        aria-label="No"
                                                                        onChange={() => setQuestionnaireToInstall(item)}
                                                                    />
                                                                    <label className="radio__label "
                                                                        htmlFor={`install-${item}`}>
                                                                        {item}
                                                                    </label>
                                                                </span>
                                                            </p>
                                                            <br />
                                                        </Fragment>
                                                    );
                                                })
                                            }
                                        </div>
                                    </fieldset>
                                    <br />

                                    <ONSButton
                                        label={"Install selected questionnaire"}
                                        primary={true}
                                        loading={installing}
                                        id="confirm-install"
                                        onClick={() => installQuestionnaireFromBucket()} />
                                </>
                        }
                    </form>
                </ErrorBoundary>
            </div>
        );
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" }, { link: "/upload", title: "Deploy a questionnaire" }
                ]
            } />

            <main id="main-content" className="page__main u-mt-no">
                <h1 className="u-mb-l">Reinstall questionnaire</h1>
                <p>
                    Reinstall a previously uploaded questionnaire.
                    <br />
                    This will always deploy the last uploaded version of the questionnaire.
                </p>
                {
                    (loading) ?
                        <ONSLoadingPanel />
                        :
                        DisplayQuestionnairesToInstallList()
                }
            </main>
        </>
    );
}

export default ReinstallQuestionnaires;
