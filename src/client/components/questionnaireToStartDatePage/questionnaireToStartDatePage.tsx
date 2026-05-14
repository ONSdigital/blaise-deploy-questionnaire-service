import { useQueryClient } from "@tanstack/react-query";
import { Button } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import { Form, Formik, type FormikHelpers } from "formik";
import React, { type ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { setToStartDate } from "../../api/toStartDate";
import { clientLogger } from "../../utils/logger";
import { AskStartDate } from "../shared/dateQuestions/askStartDate";

interface LocationState {
  toStartDate: string | null;
  questionnaireName?: string;
}

type ToStartDateFormValues = {
  askDate: string;
  toStartDate: string;
};

function QuestionnaireToStartDatePage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routeParams = useParams();
  const location = useLocation().state as LocationState | undefined;
  const { toStartDate, questionnaireName: questionnaireNameFromState } = location || {
    toStartDate: null,
    questionnaireName: null,
  };
  const questionnaireName = routeParams.questionnaireName ?? questionnaireNameFromState ?? "";

  async function handleSubmit(
    values: ToStartDateFormValues,
    actions: FormikHelpers<ToStartDateFormValues>,
  ) {
    if (values.askDate === "no") {
      values.toStartDate = "";
    }

    const toStartDateCreated = await setToStartDate(questionnaireName, values.toStartDate);

    if (!toStartDateCreated) {
      clientLogger.error("Failed to store Telephone Operations start date");

      return;
    }

    actions.setSubmitting(false);
    void queryClient.invalidateQueries({ queryKey: ["toStartDate", questionnaireName] });
    navigate(-1);
  }

  let initialValues = {
    askDate: "",
    toStartDate: "",
  };

  if (toStartDate != null) {
    initialValues = {
      askDate: "yes",
      toStartDate: dateFormatter(toStartDate).format("YYYY-MM-DD"),
    };
  }

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form id={"formID"}>
              <AskStartDate questionnaireName={questionnaireName} />

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

export default QuestionnaireToStartDatePage;
