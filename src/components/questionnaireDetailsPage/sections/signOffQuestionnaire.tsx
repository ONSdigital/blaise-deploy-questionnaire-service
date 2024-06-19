import React, { ReactElement, useEffect, useState } from "react";
import { Questionnaire } from "blaise-api-node-client";
import { getQuestionnaire, signOffQuestionnaire } from "../../../client/questionnaires";
import { Link, useNavigate } from "react-router-dom";

interface Props {
    questionnaire: Questionnaire;
}

async function signOffQuestionnaireStage(questionnaireName: string) {
    const navigate = useNavigate();
    const result = await signOffQuestionnaire(questionnaireName);
    if(result === true)
    {
        console.log("signOff Questionnaire successful");
    }        
    console.log("signOff Questionnaire unsuccessful");

    navigate(`/questionnaire/${questionnaireName}`);
} 

function SignOffQuestionnaire({ questionnaire }: Props): ReactElement {
    const [signedOff, setSignedOff] = useState<boolean>(false);

    useEffect(() => {
        getQuestionnaire(`${questionnaire.name}_EDIT`)
            .then((questionnaire: Questionnaire | undefined) => {
                if(questionnaire && questionnaire.dataRecordCount) {
                    if (questionnaire.dataRecordCount > 0) {
                        setSignedOff(true);
                    }
                }
            });
    }, []);

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
                                    {signedOff 
                                        ? <span>Stage has been signed off</span>
                                        : <Link to="#" onClick={async () => await signOffQuestionnaireStage(questionnaire.name) }>Sign off stage</Link>
                                    }
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
function setErrored(arg0: boolean) {
    throw new Error("Function not implemented.");
}

function setLoading(arg0: boolean): void {
    throw new Error("Function not implemented.");
}

