import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Formik } from "formik";

import { MockAuthenticate } from "../../../test-utils/authenticate.mock";

import { SetDate } from "./setDate";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

describe("SetDate for Telephone Operations start date", () => {
  it("should match the Snapshot", async () => {
    const wrapper = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <SetDate
          dateFieldName={"toStartDate"}
          fullDateLabel={"Telephone Operations start date"}
          shortDateLabel={"start date"}
        />
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
        <SetDate
          dateFieldName={"toStartDate"}
          fullDateLabel={"Telephone Operations start date"}
          shortDateLabel={"start date"}
        />
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
        <SetDate
          dateFieldName={"toStartDate"}
          fullDateLabel={"Telephone Operations start date"}
          shortDateLabel={"start date"}
        />
      </Formik>,
    );

    expect(queryByText(/Yes, let me specify a start date/i)).toBeInTheDocument();
  });
});

describe("SetDate for Totalmobile release date", () => {
  it("should match the Snapshot", async () => {
    const wrapper = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <SetDate
          dateFieldName={"tmReleaseDate"}
          fullDateLabel={"Totalmobile release date"}
          shortDateLabel={"release date"}
        />
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
        <SetDate
          dateFieldName={"tmReleaseDate"}
          fullDateLabel={"Totalmobile release date"}
          shortDateLabel={"release date"}
        />
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
        <SetDate
          dateFieldName={"tmReleaseDate"}
          fullDateLabel={"Totalmobile release date"}
          shortDateLabel={"release date"}
        />
      </Formik>,
    );

    expect(queryByText(/Yes, let me specify a release date/i)).toBeInTheDocument();
  });
});
