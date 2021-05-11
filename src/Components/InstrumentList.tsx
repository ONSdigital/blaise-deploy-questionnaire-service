import React, {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Instrument} from "../../Interfaces";
import dateFormatter from "dayjs";
import {filter} from "lodash";

interface Props {
    instrumentList: Instrument[],
    listError: string
}

function getStatusColor(status: string | undefined) {
    switch (status) {
        case "Active":
            return "success";
        case "Erroneous":
            return "error";
        case "Failed":
            return "error";
        default:
            return "info";
    }
}

function InstrumentList({instrumentList, listError}: Props): ReactElement {


    const [list, setList] = useState<Instrument[]>(instrumentList);
    const [listMessage, setListMessage] = useState<string>(listError);
    list.sort((a: Instrument, b: Instrument) => Date.parse(b.installDate) - Date.parse(a.installDate));

    useEffect(() => {
        if (instrumentList !== list) {
            setList(instrumentList);
        }
        if (listMessage !== listMessage) {
            setListMessage(listMessage);
        }
    }, [instrumentList, listError]);

    const filterList = (e: ChangeEvent<HTMLInputElement>) => {
        const newFilteredList = filter(instrumentList, (listItem) => listItem.name.includes(e.target.value.toUpperCase()));
        setList(newFilteredList);
        if (newFilteredList.length === 0) {
            setListMessage(`No questionnaires containing ${e.target.value}`);
        }
    };


    return <>
        <h2 className="u-mt-m">Table of questionnaires</h2>

        <div className="field">
            <label className="label  " htmlFor="filter-by-name">Filter by questionnaire name
            </label>
            <input type="text" id="filter-by-name" className="input input--text input-type__input"
                   onChange={(e) => filterList(e)}/>
        </div>

        {
            list && list.length > 0
                ?
                <table id="instrument-table" className="table u-mt-s">
                    <thead className="table__head u-mt-m">
                    <tr className="table__row">
                        <th scope="col" className="table__header ">
                            <span>Questionnaire</span>
                        </th>
                        <th scope="col" className="table__header ">
                            <span>Field period</span>
                        </th>
                        <th scope="col" className="table__header ">
                            <span>Status</span>
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
                                        <span
                                            className={`status status--${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="table__cell ">
                                        {dateFormatter(item.installDate).format("DD/MM/YYYY HH:mm")}
                                    </td>
                                    <td className="table__cell ">
                                        {item.dataRecordCount}
                                    </td>
                                    <td className={"table__cell "} id={`delete-${item.name}`}>
                                        {
                                            item.active ?
                                                "Questionnaire is live"
                                                :
                                                <Link id={`delete-button-${item.name}`}
                                                      data-testid={`delete-${item.name}`}
                                                      aria-label={`Delete questionnaire ${item.name}`}
                                                      to={{
                                                    pathname: "/delete",
                                                    state: {instrument: item}
                                                }}>
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
                        <p>{listMessage}</p>
                    </div>
                </div>
        }
    </>;
}

export default InstrumentList;
