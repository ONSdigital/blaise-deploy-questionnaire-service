import React, { ReactElement, useEffect, useState } from "react";
import { ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { filter } from "lodash";
import { Instrument } from "../../Interfaces";
import ONSTable, { TableColumns } from "./ONSTable";
import dateFormatter from "dayjs";
import { Link } from "react-router-dom";
import InstrumentStatus from "./InstrumentStatus";
import { getAllInstruments } from "../utilities/http";

type Props = {
    setErrored: (errored: boolean) => void
}

function instrumentTableRow(instrument: Instrument): ReactElement {
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
                    instrument.active && instrument.status?.toLowerCase() != "inactive" ?
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

export const InstrumentList = ({ setErrored }: Props): ReactElement => {
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);

    const [message, setMessage] = useState<string>("");
    const [filteredList, setFilteredList] = useState<Instrument[]>([]);

    const filterList = (filterValue: string) => {
        // Filter by the search field
        if (filterValue === "") {
            setFilteredList(instruments);
        }
        const newFilteredList = filter(instruments, (instrument) => instrument.name.includes(filterValue.toUpperCase()));
        // Order by date
        newFilteredList.sort((a: Instrument, b: Instrument) => Date.parse(b.installDate) - Date.parse(a.installDate));

        setFilteredList(newFilteredList);

        if (instruments.length > 0 && newFilteredList.length === 0) {
            setMessage(`No questionnaires containing ${filterValue} found`);
        }
    };

    const getInstrumentsList = async () => {
        const [success, instrumentList] = await getAllInstruments();
        console.log(`Response from get all instruments ${(success ? "successful" : "failed")}, data list length ${instrumentList.length}`);
        console.log(instrumentList);

        if (!success) {
            setMessage("Unable to load questionnaires");
            setErrored(true);
            return [];
        }

        if (instrumentList.length === 0) {
            setMessage("No installed questionnaires found.");
        }

        return instrumentList;
    };

    useEffect(() => {
        getInstrumentsList().then((instrumentList: Instrument[]) => {
            setInstruments(instrumentList);
            setFilteredList(instrumentList);
            setLoaded(true);
        });
    }, []);


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


    if (!loaded) {
        return <ONSLoadingPanel />;
    }
    return (
        <>
            <div className={"elementToFadeIn"}>
                <div className="field">
                    <label className="label" htmlFor="filter-by-name">Filter by questionnaire name
                    </label>
                    <input type="text" id="filter-by-name" className="input input--text input-type__input"
                        onChange={(e) => filterList(e.target.value)} />
                </div>


                <div className="u-mt-s">
                    {
                        instruments &&
                        <h3 aria-live="polite">{filteredList.length} results of {instruments.length}</h3>
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
};

export default InstrumentList;
