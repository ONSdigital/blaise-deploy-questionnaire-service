import React, {ReactElement} from "react";
import {FormikContextType, useFormikContext} from "formik";
import {Instrument} from "../../../../Interfaces";
import dateFormatter from "dayjs";

interface PageFourProps {
    file: File | undefined
    foundInstrument: Instrument | null
}

function DeployFormSummary({file, foundInstrument}: PageFourProps): ReactElement {
    const {values: formValues}: FormikContextType<any> = useFormikContext();

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
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Questionnaire file to deploy
                                </div>
                            </td>
                            <td className="summary__values">
                                {file?.name}
                            </td>
                        </tr>
                        </tbody>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">Does the questionnaire already exist in blaise?
                                </div>
                            </td>
                            <td className="summary__values">
                                {
                                    foundInstrument ?
                                        "Yes, overriding questionnaire." : "No."
                                }
                            </td>
                        </tr>
                        </tbody>

                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Set a live date for questionnaire?
                                </div>
                            </td>
                            <td className="summary__values">
                                {
                                    formValues["set live date"] ?
                                        `Live date set to ${dateFormatter(formValues["set live date"]).format("DD/MM/YYYY")}.`
                                        :
                                        "Live date not specified."
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
