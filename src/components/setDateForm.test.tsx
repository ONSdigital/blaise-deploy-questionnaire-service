/* eslint-disable import-x/order */
/**
 * @vitest-environment jsdom
 */

import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Formik } from "formik";

import SetDateForm from "./setDateForm";

// mock login
vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } =
    await import("blaise-login-react/blaise-login-react-client");

  return mockLoginReactClientModule();
});
const { MockAuthenticate } = await import("blaise-login-react/blaise-login-react-client");

MockAuthenticate.OverrideReturnValues(null, true);

describe("SetDateForm for TO Start Date", () => {
  it("should match the Snapshot", async () => {
    const wrapper = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <SetDateForm dateType={"start"} />
      </Formik>,
    );

    expect(wrapper).toMatchSnapshot();
  });

  it("display 'No start date'", async () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <SetDateForm dateType={"start"} />
      </Formik>,
    );

    expect(queryByText(/No start date/i)).toBeInTheDocument();
  });

  it("display 'Yes let me specify a start date'", async () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <SetDateForm dateType={"start"} />
      </Formik>,
    );

    expect(queryByText(/Yes, let me specify a start date/i)).toBeInTheDocument();
  });
});

describe("SetDateForm for TM Release Date", () => {
  it("should match the Snapshot", async () => {
    const wrapper = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <SetDateForm dateType={"release"} />
      </Formik>,
    );

    expect(wrapper).toMatchSnapshot();
  });

  it("display 'No release date'", async () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <SetDateForm dateType={"release"} />
      </Formik>,
    );

    expect(queryByText(/No release date/i)).toBeInTheDocument();
  });

  it("display 'Yes let me specify a release date'", async () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <SetDateForm dateType={"release"} />
      </Formik>,
    );

    expect(queryByText(/Yes, let me specify a release date/i)).toBeInTheDocument();
  });
});
