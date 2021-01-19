import React, {ReactElement} from "react";
import {Link} from "react-router-dom";
import {Instrument} from "../../Interfaces";
import dateFormatter from "dayjs";

interface Props {
    list: Instrument[],
    listError: string
}

function InstrumentList({list, listError}: Props): ReactElement {
    list.sort((a: Instrument, b: Instrument) => Date.parse(b.installDate) - Date.parse(a.installDate));

    return <>
        <h2 className="u-mt-m">Table of questionnaires</h2>
        {
            list && list.length > 0
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
                        list.map((item: Instrument) => {
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
                                        {
                                            !item.hasData &&
                                            <Link data-testid={`delete-${item.name}`} to={`/delete/${item.name}`}>
                                                Delete
                                            </Link>
                                        }
                                    </td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
                :
                <div className="panel panel--info panel--no-title u-mb-m">
                    <div className="panel__body">
                        <p>{listError}</p>
                    </div>
                </div>
        }
    </>;
}

export default InstrumentList;
