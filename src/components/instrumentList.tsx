import React, { ReactElement, useEffect, useState } from "react";
import { ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { filter } from "lodash";
import { Instrument } from "blaise-api-node-client";
import ONSTable, { TableColumns } from "./onsTable";
import dateFormatter from "dayjs";
import { Link } from "react-router-dom";
import InstrumentStatus from "./instrumentStatus";
import { getInstruments } from "../client/instruments";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVial } from "@fortawesome/free-solid-svg-icons";

type Props = {
    setErrored: (errored: boolean) => void
}

function instrumentTableRow(instrument: Instrument): ReactElement {
    function instrumentName(instrument: Instrument) {
        if (instrument.name.toUpperCase().startsWith("DST")) {
            return (
                <>
                    <>{instrument.name}</> <FontAwesomeIcon icon={faVial} />
                </>
            );
        }
        return <>{instrument.name}</>;
    }

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
                    {instrumentName(instrument)}
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
    const [realInstrumentCount, setRealInstrumentCount] = useState<number>(0);
    const [loaded, setLoaded] = useState<boolean>(false);

    const [message, setMessage] = useState<string>("");
    const [filteredList, setFilteredList] = useState<Instrument[]>([]);

    function filterTestInstruments(instrumentsToFilter: Instrument[], filterValue: string): Instrument[] {
        if (filterValue.toUpperCase() !== "DST") {
            instrumentsToFilter = filter(instrumentsToFilter, (instrument) => {
                if (!instrument?.name) {
                    return false;
                }
                return !instrument.name.toUpperCase().startsWith("DST");
            });
            setRealInstrumentCount(instrumentsToFilter.length);
        }
        return instrumentsToFilter;
    }

    function filterList(filterValue: string) {
        // Filter by the search field
        if (filterValue === "") {
            setFilteredList(filterTestInstruments(instruments, filterValue));
        }
        const newFilteredList = filter(filterTestInstruments(instruments, filterValue), (instrument) => instrument.name.includes(filterValue.toUpperCase()));
        // Order by date
        newFilteredList.sort((a: Instrument, b: Instrument) => Date.parse(b.installDate) - Date.parse(a.installDate));

        setFilteredList(newFilteredList);

        if (instruments.length > 0 && newFilteredList.length === 0) {
            setMessage(`No questionnaires containing ${filterValue} found`);
        }
    }

    async function getInstrumentsList() {
        let instruments: Instrument[];
        try {
            instruments = await getInstruments();
            console.log(`Response from get all instruments successful, data list length ${instruments.length}`);
        } catch (error: unknown) {
            console.log("Response from get all instruments failed");
            setMessage("Unable to load questionnaires");
            setErrored(true);
            return [];
        }

        if (instruments.length === 0) {
            setMessage("No installed questionnaires found.");
        }

        return instruments;
    }

    useEffect(() => {
        getInstrumentsList().then((instrumentList: Instrument[]) => {
            setInstruments(instrumentList);
            setFilteredList(filterTestInstruments(instrumentList, ""));
            setLoaded(true);
        });
    }, []);

    function QuestionnaireTable(): ReactElement {
        if (filteredList && filteredList.length > 0) {
            return <ONSTable columns={tableColumns}
                tableID={"instrument-table"}
            >
                {
                    filteredList.map((item: Instrument) => {
                        return instrumentTableRow(item);
                    })
                }
            </ONSTable>;
        }
        return <ONSPanel spacious={true}
            status={message.includes("Unable") ? "error" : "info"}>{message}</ONSPanel>;
    }


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
                        <h3 aria-live="polite">{filteredList.length} results of {realInstrumentCount}</h3>
                    }

                    <QuestionnaireTable />
                </div>
            </div>
        </>

    );
};

export default InstrumentList;
