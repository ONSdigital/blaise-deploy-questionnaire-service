import React, { ReactElement } from "react";
import { ONSButton } from "blaise-design-system-react-components";
import { setTOStartDate } from "../../client/toStartDate";
import dateFormatter from "dayjs";
import { useHistory, useLocation } from "react-router-dom";
import { Form, Formik } from "formik";
import AskToSetTOStartDate from "../uploadPage/sections/askToSetTOStartDate";
import Breadcrumbs from "../breadcrumbs";

interface LocationState {
    toStartDate: string | null;
    instrumentName: string;
}

function ChangeToStartDate(): ReactElement {
    const history = useHistory();
    const location = useLocation<LocationState>();
    const { toStartDate, instrumentName } = location.state || { toStartDate: null, instrumentName: null };

    async function _handleSubmit(values: any, actions: any) {
        if (values.askToSetTOStartDate === "no") {
            values["set TO start date"] = "";
        }
        const liveDateCreated = await setTOStartDate(instrumentName, values["set TO start date"]);
        if (!liveDateCreated) {
            console.log("Failed to store telephone operations start date specified");
            return;
        }
        actions.setSubmitting(false);
        history.goBack();
    }

    let initialValues = {
        askToSetTOStartDate: "",
        "set TO start date": ""
    };

    if (toStartDate != null) {
        initialValues = {
            askToSetTOStartDate: "yes",
            "set TO start date": dateFormatter(toStartDate).format("YYYY-MM-DD")
        };
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" }, { link: `/questionnaire/${instrumentName}`, title: instrumentName }
                ]
            } />

            <main id="main-content" className="page__main u-mt-no">
                <Formik
                    validateOnBlur={false}
                    validateOnChange={false}
                    initialValues={initialValues}
                    onSubmit={_handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form id={"formID"}>
                            <AskToSetTOStartDate instrumentName={instrumentName} />

                            <div className="btn-group u-mt-m">
                                <ONSButton
                                    id={"continue-deploy-button"}
                                    submit={true}
                                    loading={isSubmitting}
                                    primary={true} label={"Continue"} />
                                {!isSubmitting && (
                                    <ONSButton
                                        id={"cancel-deploy-button"}
                                        onClick={() => history.goBack()}
                                        primary={false} label={"Cancel"} />
                                )}
                            </div>

                        </Form>
                    )}
                </Formik>
            </main>
        </>
    );
}

export default ChangeToStartDate;
