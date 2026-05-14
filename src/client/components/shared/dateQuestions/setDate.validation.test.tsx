import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Formik } from "formik";

import { SetDate } from "./setDate";

const mockState = vi.hoisted(() => ({
  fieldProps: null as null | { validate: (value: string) => string | undefined },
}));

vi.mock("blaise-design-system-react-components", () => ({
  StyledFormField: (props: { validate: (value: string) => string | undefined }) => {
    mockState.fieldProps = props;

    return <div>Styled form field</div>;
  },
}));

describe("SetDate validation", () => {
  afterEach(() => {
    mockState.fieldProps = null;
  });

  it("requires an option to be selected", () => {
    render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <SetDate
          dateFieldName="toStartDate"
          fullDateLabel="Telephone Operations start date"
          shortDateLabel="start date"
        />
      </Formik>,
    );

    expect(mockState.fieldProps?.validate("")).toBe("Select an option");
  });

  it("requires a date when yes is selected", () => {
    render(
      <Formik
        initialValues={{ askDate: "yes" }}
        onSubmit={() => {}}
      >
        <SetDate
          dateFieldName="tmReleaseDate"
          fullDateLabel="Totalmobile release date"
          shortDateLabel="release date"
        />
      </Formik>,
    );

    expect(mockState.fieldProps?.validate("yes")).toBe("Enter a Totalmobile release date");
  });
});