import React, {ReactElement, useState} from "react";
import {Link, Redirect, useLocation} from "react-router-dom";
import CalendarSection from "./CalendarSection";
import dateFormatter from "dayjs";
import ViewToStartDate from "./ViewToStartDate";


interface Location {
    state: any
}

function InstrumentDetails(): ReactElement {

    const [message, setMessage] = useState<string>("");
    const [redirect, setRedirect] = useState<boolean>(false);
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
            {
                message !== "" && <p>{message}</p>
            }
            <p>
                <Link to={"/"}>Previous</Link>
            </p>
            <h1>
                {instrument.name}
            </h1>

            <ViewToStartDate instrumentName={instrument.name}/>


            <dl className="metadata metadata__list grid grid--gutterless u-cf u-mb-l"
                title="Questionnaire details"
                aria-label="Questionnaire details">
                <dt className="metadata__term grid__col col-3@m">Questionnaire status:</dt>
                <dd className="metadata__value grid__col col-8@m">{instrument.status}</dd>
                <dt className="metadata__term grid__col col-3@m">Number of cases:</dt>
                <dd className="metadata__value grid__col col-8@m">{instrument.dataRecordCount}</dd>
                <dt className="metadata__term grid__col col-3@m">Install date:</dt>
                <dd className="metadata__value grid__col col-8@m">{dateFormatter(instrument.installDate).format("DD/MM/YYYY")}</dd>
            </dl>

            <h2>Survey days</h2>
            <CalendarSection surveyDays={instrument.surveyDays}/>

        </>
    );
}

export default InstrumentDetails;
