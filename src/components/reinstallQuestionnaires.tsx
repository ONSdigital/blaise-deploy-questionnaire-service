import React, { Fragment, ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();

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

        navigate("/UploadSummary",
            {
                state: { questionnaireName: questionnaireToInstall.replace(/\.[a-zA-Z]*$/, ""), status: uploadStatus }
            }
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
                                    <fieldset className="ons-fieldset">
                                        <legend className="ons-fieldset__legend">
                                            Select a questionnaire to install
                                        </legend>
                                        <div className="ons-radios__items">
                                            {
                                                questionnaireList.map((item: string) => {
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
                                                                    <label className="ons-radio__label "
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

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <h1 className="ons-u-mb-l">Reinstall questionnaire</h1>
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
