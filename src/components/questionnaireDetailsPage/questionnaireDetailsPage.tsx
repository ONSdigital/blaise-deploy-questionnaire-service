import React, { ReactElement, useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Questionnaire } from "blaise-api-node-client";
import Breadcrumbs from "../breadcrumbs";
import BlaiseNodeInfo from "./sections/blaiseNodeInfo";
import CawiModeDetails from "./sections/cawiModeDetails";
import CatiModeDetails from "./sections/catiModeDetails";
import TotalmobileDetails from "./sections/totalmobileDetails";
import YearCalendar from "./sections/yearCalendar";
import QuestionnaireSettingsSection from "./sections/questionnaireSettingsSection";
import { getQuestionnaire, getQuestionnaireModes, getSurveyDays } from "../../client/questionnaires";
import { ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import QuestionnaireDetails from "./sections/questionnaireDetails";
import CreateDonorCases from "./sections/createDonorCases";
import CreateDonorCasesSummary from "../createDonorCasePage/createDonorCasesSummary";
import ReissueNewDonorCase from "./sections/reissueNewDonorCase";
import ReissueNewDonorCaseSummary from "../reissueNewDonorCasePage/reissueNewDonorCaseSummary";

interface State {
    section?: string;
    questionnaire: Questionnaire | null;
    responseMessage?: string;
    statusCode?: number;
    role?: string;
}

function QuestionnaireDetailsPage(): ReactElement {
    const location = useLocation().state as State;
    const navigate = useNavigate();
    const [questionnaire, setQuestionnaire] = useState<Questionnaire>();
    const [modes, setModes] = useState<string[]>([]);
    const [surveyDays, setSurveyDays] = useState<string[]>([]);
    const [errored, setErrored] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const initialState = location || { questionnaire: null };
    const { questionnaireName } = useParams();
    const { section, responseMessage, statusCode, role } = location || { section: "", responseMessage: "", statusCode: 0, role: "" };

    useEffect(() => {
        if (initialState.questionnaire === null) {
            loadQuestionnaire().then(() => {
                console.log(`Loaded questionnaire: ${questionnaireName}`);
            }).catch((error: unknown) => {
                console.log(`Failed to get questionnaire ${error}`);
                setErrored(true);
                setLoaded(true);
            });
        } else {
            setQuestionnaire(initialState.questionnaire);
        }
        if (questionnaireName)
            getQuestionnaireModes(questionnaireName)
                .then((modes) => {
                    if (modes.length === 0) {
                        console.error("returned questionnaire mode was empty");
                        setErrored(true);
                        setLoaded(true);
                        return;
                    }
                    if (modes.includes("CATI")) {
                        getSurveyDays(questionnaireName)
                            .then((surveyDays) => {
                                if (surveyDays.length === 0) {
                                    console.log("returned questionnaire survey days was empty");
                                    setSurveyDays(surveyDays);
                                    setLoaded(true);
                                    return;
                                }
                                console.log(`returned questionnaire survey days: ${surveyDays}`);
                                setSurveyDays(surveyDays);
                                setLoaded(true);
                            }).catch((error: unknown) => {
                                console.error(`Error getting questionnaire survey days ${error}`);
                                setErrored(true);
                                setLoaded(true);
                                return;
                            });
                    }
                    console.log(`returned questionnaire mode: ${modes}`);
                    setModes(modes);
                    setLoaded(true);
                }).catch((error: unknown) => {
                    console.error(`Error getting questionnaire modes ${error}`);
                    setErrored(true);
                    setLoaded(true);
                    return;
                });
    }, []);

    async function loadQuestionnaire(): Promise<void> {
        setLoaded(false);
        if (questionnaireName) {
            const fetchedQuestionnaire = await getQuestionnaire(questionnaireName);
            if (!fetchedQuestionnaire) {
                navigate("/");
            }
            setQuestionnaire(fetchedQuestionnaire);
        }
    }

    function QuestionnaireDetailsFailed(): ReactElement {
        if (!loaded) {
            return <ONSLoadingPanel />;
        }

        console.log(questionnaire);
        if (errored || !questionnaire) {
            return (
                <ONSPanel status="error">
                    Could not get questionnaire details, please try again
                </ONSPanel>
            );
        }

        return (
            <>
                <h1 className="ons-u-mb-l">
                    {questionnaire.name}
                </h1>
                {section === "createDonorCases" && responseMessage && statusCode && role && <CreateDonorCasesSummary donorCasesResponseMessage={responseMessage} donorCasesStatusCode={statusCode} role={role} />}
                {section === "reissueNewDonorCase" && responseMessage && statusCode && role && <ReissueNewDonorCaseSummary responseMessage={responseMessage} statusCode={statusCode} role={role} />}
                <QuestionnaireDetails questionnaire={questionnaire} modes={modes} />
                {questionnaire.name.includes("IPS") && <CreateDonorCases questionnaire={questionnaire} />}
                {questionnaire.name.includes("IPS") && <ReissueNewDonorCase questionnaire={questionnaire} />}
                <ONSPanel>
                    When a questionnaire file is uploaded and you wish for interviewers to receive donor cases to perform interviews, you select <b>Create Cases</b> under the Donor Cases section. 
                    <br />
                    <br />
                    If a new interviewer is created that has not been given an initial donor case, you can issue a <b>Create Cases</b> again , and it will only give donor cases to those missing an initial donor case.
                    <br />
                    <br />
                    However, if an interviewer requires a new donor case that was already been assigned an initial donor case, you need to reissue one to them individually by specifying their username and selecting <b>Reissue a Donor Case</b>.
                    
                </ONSPanel>
                <br />
                <CatiModeDetails questionnaireName={questionnaire.name} modes={modes} />
                <CawiModeDetails questionnaire={questionnaire} modes={modes} />
                <TotalmobileDetails questionnaireName={questionnaire.name} />
                <QuestionnaireSettingsSection questionnaire={questionnaire} modes={modes} />
                <YearCalendar modes={modes} surveyDays={surveyDays} />
                <BlaiseNodeInfo questionnaire={questionnaire} />

                <br></br>

                <ONSButton
                    label={"Delete Questionnaire"}
                    primary={false}
                    aria-label={`Delete questionnaire ${questionnaire.name}`}
                    id="delete-questionnaire"
                    testid="delete-questionnaire"
                    onClick={() => navigate("/delete", { state: { questionnaire, modes } }
                    )} />
            </>
        );
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
                ]
            } />

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <QuestionnaireDetailsFailed />
            </main>
        </>
    );
}

export default QuestionnaireDetailsPage;
