import React, {ReactElement} from "react";
import {FormikContextType, useFormikContext} from "formik";
import {Questionnaire} from "blaise-api-node-client";
import dateFormatter from "dayjs";
import {roundUp} from "../../../utilities/maths";

interface PageFourProps {
    file: File | undefined
    foundQuestionnaire: Questionnaire | null
}

function DeployFormSummary({file, foundQuestionnaire}: PageFourProps): ReactElement {
    const {values: formValues}: FormikContextType<any> = useFormikContext();

    function QuestionnaireFileName(): ReactElement {
        return (
            <>
                <tbody className="summary__item">
                    <tr className="summary__row summary__row--has-values">
                        <td className="summary__item-title">
                            <div className="summary__item--text">
                                Questionnaire file name
                            </div>
                        </td>
                        <td className="summary__values">
                            {file?.name}
                        </td>
                    </tr>
                </tbody>
            </>
        );
    }

    return (
        <>
            <div className="summary">
                <div className="summary__group">
                    <h1 className="summary__group-title">Deployment summary</h1>
                    <table className="summary__items">
                        <thead className="u-vh">
                        <tr>
                            <th>Question</th>
                            <th>Answer given</th>
                        </tr>
                        </thead>
                        <QuestionnaireFileName/>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Questionnaire file last modified date
                                </div>
                            </td>
                            <td className="summary__values">
                                {dateFormatter(file?.lastModified).format("DD/MM/YYYY HH:MM")}
                            </td>
                        </tr>
                        </tbody>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Questionnaire file size
                                </div>
                            </td>
                            <td className="summary__values">
                                {(file && roundUp(file.size / 1000000, 0))}MB
                            </td>
                        </tr>
                        </tbody>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Does the questionnaire already exist in blaise?
                                </div>
                            </td>
                            <td className="summary__values">
                                {
                                    foundQuestionnaire ?
                                        "Yes, overriding questionnaire" : "No"
                                }
                            </td>
                        </tr>
                        </tbody>

                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Set a telephone operations start date for questionnaire?
                                </div>
                            </td>
                            <td className="summary__values">
                                {
                                    formValues["set start date"] ?
                                        `Start date set to ${dateFormatter(formValues["set start date"]).format("DD/MM/YYYY")}`
                                        :
                                        "Start date not specified"
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

export default DeployFormSummary;
