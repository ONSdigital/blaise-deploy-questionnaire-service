import React, {ReactElement, useState} from "react";
import {Link, Redirect, useHistory, useLocation} from "react-router-dom";
import CalendarSection from "./CalendarSection";
interface Location {
    state: any
}

function InstrumentDetails(): ReactElement {
    const [confirm, setConfirm] = useState<boolean | null>(null);
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [redirect, setRedirect] = useState<boolean>(false);
    const [formError, setFormError] = useState<string>("");
    const history = useHistory();
    const location = useLocation();
    const {instrument} = (location as Location).state || {instrument: null};



    return (
        <>
            {
                redirect && <Redirect
                    to={{
                        pathname: "/",
                        state: {status: message}
                    }}/>
            }
            <p>
                <Link to={"/"}>Previous</Link>
            </p>
            <h1>
                {instrument.name}
            </h1>

            <p>
                Status {instrument.status}
            </p>
            <p>
                Survey Live {instrument.active}
            </p>
            <p>
                Survey Live Today {instrument.activeToday}
            </p>
            <p>
                Data record count: {instrument.dataRecordCount}
            </p>
            <p>
                Field Period {instrument.fieldPeriod}
            </p>
            <p>
                Install date {instrument.installDate}
            </p>
            <p>
                Server park name:  {instrument.serverParkName}
            </p>

            <h2>Survey days</h2>
            <CalendarSection surveyDays={instrument.surveyDays}/>

        </>
    );
}

export default InstrumentDetails;
