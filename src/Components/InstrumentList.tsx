import React, { ReactElement, useEffect, useState } from "react";
import { ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { filter } from "lodash";
import { Instrument } from "../../Interfaces";
import ONSTable, { TableColumns } from "./ONSTable";
import dateFormatter from "dayjs";
import { Link } from "react-router-dom";
import InstrumentStatus from "./InstrumentStatus";

interface Props {
    instrumentList: Instrument[];
    loading: boolean;
    listMessage: string;
}

function instrumentTableRow(instrument: Instrument) {
    return (
        <tr className="table__row" key={instrument.name} data-testid={"instrument-table-row"}>
            <td className="table__cell ">
                <Link
                    id={`info-${instrument.name}`}
                    data-testid={`info-${instrument.name}`}
                    aria-label={`View more information for questionnaire ${instrument.name}`}
                    to={{
                        pathname: "/questionnaire",
                        state: { instrument: instrument }
                    }}>
                    {instrument.name}
                </Link>
            </td>
            <td className="table__cell ">
                {instrument.fieldPeriod}
            </td>
            <td className="table__cell ">
                <InstrumentStatus status={instrument.status ? instrument.status : ""} />
            </td>
            <td className="table__cell ">
                {dateFormatter(instrument.installDate).format("DD/MM/YYYY HH:mm")}
            </td>
            <td className="table__cell ">
                {instrument.dataRecordCount}
            </td>
            <td className={"table__cell "} id={`delete-${instrument.name}`}>
                {
                    instrument.active ?
                        "Questionnaire is live"
                        :
                        <Link id={`delete-button-${instrument.name}`}
                            data-testid={`delete-${instrument.name}`}
                            aria-label={`Delete questionnaire ${instrument.name}`}
                            to={{
                                pathname: "/delete",
                                state: { instrument: instrument }
                            }}>
                            Delete
                        </Link>
                }
            </td>
        </tr>
    );
}

export const InstrumentList = (props: Props): ReactElement => {
    const { instrumentList, loading, listMessage } = props;

    const [message, setMessage] = useState<string>("");
    const [filterValue, setFilterValue] = useState<string>("");
    const [filteredList, setFilteredList] = useState<Instrument[]>([]);

    const filterList = () => {
        // Filter by the search field
        const newFilteredList = filter(instrumentList, (instrument) => instrument.name.includes(filterValue.toUpperCase()));
        // Order by date
        newFilteredList.sort((a: Instrument, b: Instrument) => Date.parse(b.installDate) - Date.parse(a.installDate));

        setFilteredList(newFilteredList);

        if (instrumentList.length > 0 && newFilteredList.length === 0) {
            setMessage(`No questionnaires containing ${filterValue} found`);
        } else {
            setMessage(listMessage);
        }
    };

    useEffect(() => {
        filterList();
    }, [instrumentList, filterValue, listMessage]);

    const tableColumns: TableColumns[] =
        [
            {
                title: "Questionnaire"
            },
            {
                title: "Field period"
            },
            {
                title: "Status"
            },
            {
                title: "Install date"
            },
            {
                title: "Cases"
            },
            {
                title: "Delete questionnaire"
            }
        ];


    if (loading) {
        return <ONSLoadingPanel />;
    } else {
        return (
            <>
                <div className={"elementToFadeIn"}>
                    <div className="field">
                        <label className="label" htmlFor="filter-by-name">Filter by questionnaire name
                        </label>
                        <input type="text" id="filter-by-name" className="input input--text input-type__input"
                            onChange={(e) => setFilterValue(e.target.value)} />
                    </div>


                    <div className="u-mt-s">
                        {
                            instrumentList &&
                            <h3 aria-live="polite">{filteredList.length} results of {instrumentList.length}</h3>
                        }

                        {
                            filteredList && filteredList.length > 0 ?
                                <ONSTable columns={tableColumns}
                                    tableID={"instrument-table"}
                                >
                                    {
                                        filteredList.map((item: Instrument) => {
                                            return instrumentTableRow(item);
                                        })
                                    }
                                </ONSTable>
                                :
                                <ONSPanel spacious={true}
                                    status={message.includes("Unable") ? "error" : "info"}>{message}</ONSPanel>
                        }
                    </div>
                </div>
            </>

        );
    }
};

export default InstrumentList;
