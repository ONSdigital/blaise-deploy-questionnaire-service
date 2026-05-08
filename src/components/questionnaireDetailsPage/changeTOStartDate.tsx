import { Button } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import { Form, Formik, type FormikHelpers } from "formik";
import React, { type ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { clientLogger } from "../../client/logger";
import { setToStartDate } from "../../client/toStartDate";
import Breadcrumbs from "../breadcrumbs";
import AskToSetToStartDate from "../uploadPage/sections/askToSetToStartDate";

interface LocationState {
  toStartDate: string | null;
  questionnaireName: string;
}

type ToStartDateFormValues = {
  askToSetDate: string;
  "set start date": string;
};

function ChangeToStartDate(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation().state as LocationState;
  const { toStartDate, questionnaireName } = location || {
    toStartDate: null,
    questionnaireName: null,
  };

  async function handleSubmit(
    values: ToStartDateFormValues,
    actions: FormikHelpers<ToStartDateFormValues>,
  ) {
    if (values.askToSetDate === "no") {
      values["set start date"] = "";
    }

    const liveDateCreated = await setToStartDate(questionnaireName, values["set start date"]);

    if (!liveDateCreated) {
      clientLogger.info("Failed to store telephone operations start date specified");

      return;
    }

    actions.setSubmitting(false);
    navigate(-1);
  }

  let initialValues = {
    askToSetDate: "",
    "set start date": "",
  };

  if (toStartDate != null) {
    initialValues = {
      askToSetDate: "yes",
      "set start date": dateFormatter(toStartDate).format("YYYY-MM-DD"),
    };
  }

  return (
    <>
      <Breadcrumbs
        breadcrumbList={[
          { link: "/", title: "Home" },
          { link: `/questionnaire/${questionnaireName}`, title: questionnaireName },
        ]}
      />

      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form id={"formID"}>
              <AskToSetToStartDate questionnaireName={questionnaireName} />

              <div className="ons-btn-group ons-u-mt-m">
                <Button
                  id={"continue-deploy-button"}
                  submit={true}
                  loading={isSubmitting}
                  primary={true}
                  label={"Continue"}
                />
                {!isSubmitting && (
                  <Button
                    id={"cancel-deploy-button"}
                    onClick={() => navigate(-1)}
                    primary={false}
                    label={"Cancel"}
                  />
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
