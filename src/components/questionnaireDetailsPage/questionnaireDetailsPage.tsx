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
import { getQuestionnaire, getQuestionnaireModes, getSurveyDays, signOffQuestionnaire } from "../../client/questionnaires";
import { ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import QuestionnaireDetails from "./sections/questionnaireDetails";

interface State {
    questionnaire: Questionnaire | null;
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

    async function signOffQuestionnaireStage(questionnaireName: string) {
        const result = await signOffQuestionnaire(questionnaireName);
        if(result === true)
        {
            console.log("signOffQuestionnaire successful");
            return;
        }
              
        setErrored(true);
    } 
    
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

                <QuestionnaireDetails questionnaire={questionnaire} modes={modes} />
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

                <ONSButton
                    label={"Sign off Questionnaire"}
                    primary={false}
                    aria-label={`Sign off questionnaire ${questionnaire.name}`}
                    id="signoff-questionnaire"
                    testid="signoff-questionnaire"
                    onClick={() => signOffQuestionnaireStage(questionnaire.name) }
                />                    
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
