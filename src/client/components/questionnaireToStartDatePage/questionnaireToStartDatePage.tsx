import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, LoadingPanel, Panel } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import { Form, Formik, type FormikHelpers } from "formik";
import React, { type ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { getToStartDate, setToStartDate } from "../../api/toStartDate";
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
  const toStartDateFromState = location?.toStartDate;
  const questionnaireNameFromState = location?.questionnaireName;
  const questionnaireName = routeParams.questionnaireName ?? questionnaireNameFromState ?? "";

  const {
    data: fetchedToStartDate = "",
    isLoading: toStartDateLoading,
    error: toStartDateError,
  } = useQuery({
    queryKey: ["toStartDate", questionnaireName],
    queryFn: () => getToStartDate(questionnaireName),
    enabled: !!questionnaireName && toStartDateFromState === undefined,
  });

  const toStartDate =
    toStartDateFromState === undefined
      ? fetchedToStartDate === ""
        ? null
        : fetchedToStartDate
      : toStartDateFromState;

  function navigateBackToQuestionnaire(): void {
    if (questionnaireName) {
      navigate(`/questionnaire/${questionnaireName}`, { replace: true });

      return;
    }

    navigate(-1);
  }

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
    navigateBackToQuestionnaire();
  }

  let initialValues = {
    askDate: "",
    toStartDate: "",
  };

  if (questionnaireName && toStartDateLoading) {
    return (
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <LoadingPanel message={"Getting Telephone Operations start date"} />
      </main>
    );
  }

  if (questionnaireName && toStartDateError) {
    return (
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <Panel status="error">Failed to get Telephone Operations start date</Panel>
      </main>
    );
  }

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
          enableReinitialize={true}
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
                    onClick={navigateBackToQuestionnaire}
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
