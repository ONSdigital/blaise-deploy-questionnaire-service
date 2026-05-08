/* eslint-disable import-x/order */
/**
 * @vitest-environment jsdom
 */

import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Formik } from "formik";

import AskToSetTmReleaseDate from "./askToSetTmReleaseDate";

describe("Ask to set Tm release date page", () => {
  it("should match the Snapshot", () => {
    const wrapper = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <AskToSetTmReleaseDate questionnaireName={"LMS2207T"} />
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
        <AskToSetTmReleaseDate questionnaireName={"LMS2207T"} />
      </Formik>,
    );

    expect(queryByText(/LMS2207T/i)).toBeInTheDocument();
  });

  it("should render with SetDateForm displayed", () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <AskToSetTmReleaseDate questionnaireName={"LMS2207T"} />
      </Formik>,
    );

    expect(queryByText(/Yes, let me specify a release date/i)).toBeInTheDocument();
  });
});
