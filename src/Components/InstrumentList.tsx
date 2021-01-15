import ExternalLink from "./ONSDesignSystem/ExternalLink";
import React, {ReactElement} from "react";
import {Link, useParams} from "react-router-dom";
import {Instrument, Survey} from "../../Interfaces";
import dateFormatter from "dayjs";

interface listError {
    error: boolean,
    message: string
}

interface Props {
    list: Instrument[],
    listError: listError
}

function InstrumentList(props: Props): ReactElement {
    const {list, listError}: Props = props;
    const surveyInstruments: Instrument[] = list;

    surveyInstruments.sort((a: Instrument, b: Instrument) => Date.parse(b.installDate) - Date.parse(a.installDate));

    return <>
        <h2 className="u-mt-m">Table of questionnaires</h2>
        {
            surveyInstruments && surveyInstruments.length > 0
                ?
                <table id="instrument-table" className="table ">
                    <thead className="table__head u-mt-m">
                    <tr className="table__row">
                        <th scope="col" className="table__header ">
                            <span>Questionnaire</span>
                        </th>
                        <th scope="col" className="table__header ">
                            <span>Field period</span>
                        </th>
                        <th scope="col" className="table__header ">
                            <span>Install date</span>
                        </th>
                        <th scope="col" className="table__header ">
                            <span>Cases</span>
                        </th>
                        <th scope="col" className="table__header ">
                            <span>Delete questionnaire</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="table__body">
                    {
                        surveyInstruments.map((item: Instrument) => {
                            return (
                                <tr className="table__row" key={item.name} data-testid={"instrument-table-row"}>
                                    <td className="table__cell ">
                                        {item.name}
                                    </td>
                                    <td className="table__cell ">
                                        {item.fieldPeriod}
                                    </td>
                                    <td className="table__cell ">
                                        {dateFormatter(item.installDate).format("DD/MM/YYYY HH:mm")}
                                    </td>
                                    <td className="table__cell ">
                                        {item.dataRecordCount}
                                    </td>
                                    <td className={"table__cell "}>
                                        <Link to="/delete">
                                            Delete
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
                :
                <div className="panel panel--info panel--simple u-mb-m">
                    <div className="panel__body">
                        <p>{listError.message}</p>
                    </div>
                </div>
        }
    </>;
}

export default InstrumentList;
