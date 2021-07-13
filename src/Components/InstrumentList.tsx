import React, {ReactElement, useEffect, useState} from "react";
import {ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import {filter} from "lodash";
import {Instrument} from "../../Interfaces";
import ONSTable, {TableColumns} from "./ONSTable";
import dateFormatter from "dayjs";
import {Link, useLocation} from "react-router-dom";

interface Props {
    instrumentList: Instrument[]
    loading: boolean
    listMessage: string
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

export const InstrumentList = (props: Props): ReactElement => {
    const {instrumentList, loading, listMessage} = props;

    const [message, setMessage] = useState<string>("");
    const [filterValue, setFilterValue] = useState<string>("");
    const [filteredList, setFilteredList] = useState<Instrument[]>([]);

    // Add /?filter to url for feature toggle of filter field
    const showFilter = new URLSearchParams(useLocation().search).has("filter");


    const filterList = () => {
        // Filter by the search field
        const newFilteredList = filter(instrumentList, (listItem) => listItem.name.includes(filterValue.toUpperCase()));
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


    function instrumentListBody(): ReactElement {
        return <>
            {
                filteredList.map((item: Instrument) => {
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
        </>;
    }


    if (loading) {
        return <ONSLoadingPanel/>;
    } else {
        return (
            <>
                <div className={"elementToFadeIn"}>
                    {
                        showFilter &&
                        <div className="field">
                            <label className="label" htmlFor="filter-by-name">Filter by questionnaire name
                            </label>
                            <input type="text" id="filter-by-name" className="input input--text input-type__input"
                                   onChange={(e) => setFilterValue(e.target.value)}/>
                        </div>

                    }


                    <div className="u-mt-s">
                        {
                            instrumentList &&
                            <h3 aria-live="polite">{filteredList.length} results of {instrumentList.length}</h3>
                        }

                        {
                            filteredList && filteredList.length > 0 ?
                                <ONSTable columns={tableColumns}
                                          tableID={"tableID"}
                                          tableBody={instrumentListBody()}/>
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
