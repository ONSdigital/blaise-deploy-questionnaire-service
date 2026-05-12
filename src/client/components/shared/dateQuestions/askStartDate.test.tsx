import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Formik } from "formik";

import { AskStartDate } from "./askStartDate";

describe("Ask to set To start date page", () => {
  it("should render with the questionnaire name displayed", () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <AskStartDate questionnaireName={"OPN2004A"} />
      </Formik>,
    );

    expect(queryByText(/OPN2004A/i)).toBeInTheDocument();
  });

  it("should render with the start date prompt displayed", () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <AskStartDate questionnaireName={"OPN2004A"} />
      </Formik>,
    );

    expect(queryByText(/Yes, let me specify a start date/i)).toBeInTheDocument();
  });

  it("should render with the no start date option displayed", () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <AskStartDate questionnaireName={"OPN2004A"} />
      </Formik>,
    );

    expect(queryByText(/No start date/i)).toBeInTheDocument();
  });
});
