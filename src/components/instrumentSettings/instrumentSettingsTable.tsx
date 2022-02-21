import React, { Component, ReactElement } from "react";
import { ONSPanel, ONSLoadingPanel } from "blaise-design-system-react-components";
import { InstrumentSettings } from "blaise-api-node-client";
import { formatText } from "../../utilities/textFormatting/textFormatting";

type InstrumentSettingsProps = {
  instrumentSettings: InstrumentSettings | undefined
  invalidSettings: Partial<InstrumentSettings>
  errored: boolean
}

type InstrumentSettingsState = {
  loaded: boolean
}

export default class InstrumentSettingsTable extends Component<InstrumentSettingsProps, InstrumentSettingsState> {
  constructor(props: InstrumentSettingsProps) {
    super(props);
    this.state = {
      loaded: false
    };
  }

  formatSetting(property: string, value: any, invalid: boolean, correctValue: any): ReactElement {
    return (
      <tbody className={`summary__item ${invalid ? "summary__item--error" : ""}`} key={property}>
        {
          invalid &&
          <tr className="summary__row">
            <th colSpan={3} className="summary__row-title u-fs-r">
              {formatText(property)} should
              be {(typeof correctValue === "boolean") ? (correctValue ? "True" : "False") : correctValue}
            </th>
          </tr>
        }
        <tr className="summary__row summary__row--has-values">
          <td className="summary__item-title">
            <div className="summary__item--text">
              {formatText(property)}
            </div>
          </td>
          <td className="summary__values" colSpan={2}>
            {(typeof value === "boolean") ? (value ? "True" : "False") : value}
          </td>
        </tr>
      </tbody>
    );
  }

  formatSettings(): ReactElement {
    const newElements: ReactElement[] = [];
    if (this.props.instrumentSettings) {
      for (const [property, value] of Object.entries(this.props.instrumentSettings)) {
        let invalid = false;
        let correctValue;
        if (property in this.props.invalidSettings) {
          invalid = true;
          correctValue = this.props.invalidSettings[property as keyof InstrumentSettings];
        }

        newElements.push(
          this.formatSetting(property, value, invalid, correctValue)
        );
      }
    }

    return (
      <div className="summary" >
        <div className="summary__group">
          <h2>Questionnaire settings</h2>
          <table id="report-table" className="summary__items u-mt-s">
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
