import React, { ReactElement } from "react";
import { Questionnaire } from "blaise-api-node-client";
import { ONSButton } from "blaise-design-system-react-components";
import { signOffQuestionnaire } from "../../../client/questionnaires";
import { Link } from "react-router-dom";

interface Props {
    questionnaire: Questionnaire;
}

async function signOffQuestionnaireStage(questionnaireName: string) {
    const result = await signOffQuestionnaire(questionnaireName);
    if(result === true)
    {
        console.log("signOff Questionnaire successful");
        return;
    }        
    console.log("signOff Questionnaire unsuccessful");
} 

function SignOffQuestionnaire({ questionnaire }: Props): ReactElement {
    return (
        <>
            <div className="ons-summary ons-u-mb-m">
                <div className="ons-summary__group">
                    <h2 className="ons-summary__group-title">Sign off questionnaire stage</h2>
                    <table className="ons-summary__items">
                        <thead className="ons-u-vh">
                            <tr>
                                <th>Detail</th>
                                <th>Output</th>
                            </tr>
                        </thead>
                        <tbody className="ons-summary__item">
                            <tr className="ons-summary__row ons-summary__row--has-values">
                                <td className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">
                                    Sign off
                                    </div>
                                </td>
                                <td className="ons-summary__values" colSpan={2}>
                                    <Link to="#" onClick={async () => await signOffQuestionnaireStage(questionnaire.name) }>Home</Link>
                                    {/* <ONSButton
                                        label={"Sign off Questionnaire"}
                                        primary={false}
                                        aria-label={`Sign off questionnaire ${questionnaire.name}`}
                                        id="signoff-questionnaire"
                                        testid="signoff-questionnaire"
                                        onClick={async () => await signOffQuestionnaireStage(questionnaire.name) }
                                    />                                      */}
                                </td>
                            </tr>
                        </tbody>

                    </table>
                </div>
            </div>
        </>
    );
}

export default SignOffQuestionnaire;
