import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import { Formik } from "formik";

import { AskToStartDate } from "./askToStartDate";

describe("Ask to set Telephone Operations start date", () => {
  it("should render with the questionnaire name displayed", () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <AskToStartDate questionnaireName={"OPN2004A"} />
      </Formik>,
    );

    expect(queryByText(/OPN2004A/i)).toBeInTheDocument();
  });

  it("should render with the Telephone Operations start date prompt displayed", () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <AskToStartDate questionnaireName={"OPN2004A"} />
      </Formik>,
    );

    expect(queryByText(/Yes, let me specify a start date/i)).toBeInTheDocument();
  });

  it("should render with the no Telephone Operations start date option displayed", () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <AskToStartDate questionnaireName={"OPN2004A"} />
      </Formik>,
    );

    expect(queryByText(/No start date/i)).toBeInTheDocument();
  });
});
