import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import { Formik } from "formik";

import { MockAuthenticate } from "../../../test-utils/authenticate.mock";

import { createValidateRadio, SetDate } from "./setDate";

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

describe("SetDate validation", () => {
  it("requires an option to be selected", () => {
    const validate = createValidateRadio({}, "toStartDate", "Telephone Operations start date");

    expect(validate("")).toBe("Select an option");
  });

  it("requires a date when yes is selected", () => {
    const validate = createValidateRadio(
      { askDate: "yes" },
      "tmReleaseDate",
      "Totalmobile release date",
    );

    expect(validate("yes")).toBe("Enter a Totalmobile release date");
  });
});
