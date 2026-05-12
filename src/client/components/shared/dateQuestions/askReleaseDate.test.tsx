import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Formik } from "formik";

import { AskReleaseDate } from "./askReleaseDate";

describe("Ask to set Totalmobile release date page", () => {
  it("should match the Snapshot", () => {
    const wrapper = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <AskReleaseDate questionnaireName={"LMS2207T"} />
      </Formik>,
    );

    expect(wrapper).toMatchSnapshot();
  });

  it("should render with the questionnaire name displayed", () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <AskReleaseDate questionnaireName={"LMS2207T"} />
      </Formik>,
    );

    expect(queryByText(/LMS2207T/i)).toBeInTheDocument();
  });

  it("should render with SetDate displayed", () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <AskReleaseDate questionnaireName={"LMS2207T"} />
      </Formik>,
    );

    expect(queryByText(/Yes, let me specify a release date/i)).toBeInTheDocument();
  });
});
