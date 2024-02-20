import React, { ReactElement } from "react";
import { ONSButton } from "blaise-design-system-react-components";
import { setTOStartDate } from "../../client/toStartDate";
import dateFormatter from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Formik } from "formik";
import AskToSetTOStartDate from "../uploadPage/sections/askToSetTOStartDate";
import Breadcrumbs from "../breadcrumbs";

interface LocationState {
    toStartDate: string | null;
    questionnaireName: string;
}

function ChangeTOStartDate(): ReactElement {
    const navigate = useNavigate();
    const location = useLocation().state as LocationState;
    const { toStartDate, questionnaireName } = location || { toStartDate: null, questionnaireName: null };

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
        navigate(-1);
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
                                        onClick={() => navigate(-1)}
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
