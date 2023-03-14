import React, { ReactElement, useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Questionnaire } from "blaise-api-node-client";
import Breadcrumbs from "../breadcrumbs";
import BlaiseNodeInfo from "./sections/blaiseNodeInfo";
import CawiModeDetails from "./sections/cawiModeDetails";
import CatiModeDetails from "./sections/catiModeDetails";
import TotalmobileDetails from "./sections/totalmobileDetails";
import YearCalendar from "./sections/yearCalendar";
import ViewQuestionnaireSettings from "./viewQuestionnaireSettings";
import { getQuestionnaire, getQuestionnaireModes, getSurveyDays } from "../../client/questionnaires";
import { ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import QuestionnaireDetails from "./sections/questionnaireDetails";

interface State {
    questionnaire: Questionnaire | null;
}

interface Params {
    questionnaireName: string
}

function QuestionnaireDetailsPage(): ReactElement {
    const location = useLocation<State>();
    const history = useHistory();
    const [questionnaire, setQuestionnaire] = useState<Questionnaire>();
    const [modes, setModes] = useState<string[]>([]);
    const [surveyDays, setSurveyDays] = useState<string[]>([]);
    const [errored, setErrored] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const initialState = location.state || { questionnaire: null };
    const { questionnaireName }: Params = useParams();

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
        const fetchedQuestionnaire = await getQuestionnaire(questionnaireName);
        if (!fetchedQuestionnaire) {
            history.push("/");
        }
        setQuestionnaire(fetchedQuestionnaire);
    }

    function QuestionnaireDetailsFailed(): ReactElement {
        if (!loaded) {
            return <ONSLoadingPanel/>;
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

                <QuestionnaireDetails questionnaire={questionnaire} modes={modes}/>
                <CatiModeDetails questionnaireName={questionnaire.name} modes={modes}/>
                <CawiModeDetails questionnaire={questionnaire} modes={modes}/>
                <TotalmobileDetails questionnaireName={questionnaire.name}/>
                <ViewQuestionnaireSettings questionnaire={questionnaire} modes={modes}/>
                <YearCalendar modes={modes} surveyDays={surveyDays}/>
                <BlaiseNodeInfo questionnaire={questionnaire}/>

                <br></br>

                <ONSButton
                    label={"Delete Questionnaire"}
                    primary={false}
                    aria-label={`Delete questionnaire ${questionnaire.name}`}
                    id="delete-questionnaire"
                    testid="delete-questionnaire"
                    onClick={() => history.push("/delete", { questionnaire, modes })}/>
            </>
        );
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
                ]
            }/>

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <QuestionnaireDetailsFailed/>
            </main>
        </>
    );
}

export default QuestionnaireDetailsPage;
