import React, { Component, ReactElement } from "react";
import { ONSPanel, ONSLoadingPanel } from "blaise-design-system-react-components";
import { IQuestionnaireSettings } from "blaise-api-node-client";
import { formatText } from "../../../utilities/textFormatting/textFormatting";

type QuestionnaireSettingsProps = {
  questionnaireSettings: IQuestionnaireSettings | undefined
  invalidSettings: Partial<IQuestionnaireSettings>
  errored: boolean
}

type QuestionnaireSettingsState = {
  loaded: boolean
}

export default class QuestionnaireSettingsTable extends Component<QuestionnaireSettingsProps, QuestionnaireSettingsState> {
    constructor(props: QuestionnaireSettingsProps) {
        super(props);
        this.state = {
            loaded: false
        };
    }

    formatSetting(property: string, value: any, invalid: boolean, correctValue: any): ReactElement {
        return (
            <tbody className={`ons-summary__item ${invalid ? "ons-summary__item--error" : ""}`} key={property}>
                {
                    invalid &&
          <tr className="ons-summary__row">
              <th colSpan={3} className="ons-summary__row-title ons-u-fs-r">
                  {formatText(property)} should
              be {(typeof correctValue === "boolean") ? (correctValue ? "True" : "False") : correctValue}
              </th>
          </tr>
                }
                <tr className="ons-summary__row ons-summary__row--has-values">
                    <td className="ons-summary__item-title">
                        <div className="ons-summary__item--text">
                            {formatText(property)}
                        </div>
                    </td>
                    <td className="ons-summary__values" colSpan={2}>
                        {(typeof value === "boolean") ? (value ? "True" : "False") : value}
                    </td>
                </tr>
            </tbody>
        );
    }

    formatSettings(): ReactElement {
        const newElements: ReactElement[] = [];
        if (this.props.questionnaireSettings) {
            for (const [property, value] of Object.entries(this.props.questionnaireSettings)) {
                let invalid = false;
                let correctValue;
                if (property in this.props.invalidSettings) {
                    invalid = true;
                    correctValue = this.props.invalidSettings[property as keyof IQuestionnaireSettings];
                }

                newElements.push(
                    this.formatSetting(property, value, invalid, correctValue)
                );
            }
        }

        return (
            <div className="ons-summary" >
                <div className="ons-summary__group">
                    <h2>Questionnaire settings</h2>
                    <table id="report-table" className="ons-summary__items ons-u-mt-s">
                        {
                            newElements.map((element => {
                                return element;
                            }))
                        }
                    </table>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.setState({
            loaded: true
        });
    }

    render(): ReactElement {
        if (this.props.errored) {
            return (
                <>
                    <ONSPanel status={"error"}>
                        <p>Failed to get questionnaire settings</p>
                    </ONSPanel>
                </>

            );
        }

        if (this.state.loaded) {
            return this.formatSettings();
        }

        return (
            <ONSLoadingPanel message={"Getting questionnaire settings"} />
        );
    }
}
