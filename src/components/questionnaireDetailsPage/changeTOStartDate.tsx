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
    questionnaireName: string;
}

function ChangeTOStartDate(): ReactElement {
    const history = useHistory();
    const location = useLocation<LocationState>();
    const { toStartDate, questionnaireName } = location.state || { toStartDate: null, questionnaireName: null };

    async function _handleSubmit(values: any, actions: any) {
        if (values.askToSetDate === "no") {
            values["set start date"] = "";
        }
        const liveDateCreated = await setTOStartDate(questionnaireName, values["set start date"]);
        if (!liveDateCreated) {
            console.log("Failed to store telephone operations start date specified");
            return;
        }
        actions.setSubmitting(false);
        history.goBack();
    }

    let initialValues = {
        askToSetDate: "",
        "set start date": ""
    };

    if (toStartDate != null) {
        initialValues = {
            askToSetDate: "yes",
            "set start date": dateFormatter(toStartDate).format("YYYY-MM-DD")
        };
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" }, { link: `/questionnaire/${questionnaireName}`, title: questionnaireName }
                ]
            } />

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <Formik
                    validateOnBlur={false}
                    validateOnChange={false}
                    initialValues={initialValues}
                    onSubmit={_handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form id={"formID"}>
                            <AskToSetTOStartDate questionnaireName={questionnaireName} />

                            <div className="ons-btn-group ons-u-mt-m">
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

export default ChangeTOStartDate;