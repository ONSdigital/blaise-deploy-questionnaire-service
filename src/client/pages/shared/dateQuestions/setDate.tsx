import { Field, useFormikContext } from "formik";
import { type ReactElement } from "react";

interface DateFormProps {
  dateFieldName: string;
  fullDateLabel: string;
  shortDateLabel: string;
}

type DateFormValues = {
  askDate?: string;
  [key: string]: string | undefined;
};

export function createValidateRadio(
  values: DateFormValues,
  dateFieldName: string,
  fullDateLabel: string,
) {
  return (value: string): string | undefined => {
    if (!value) {
      return "Select an option";
    }

    if (values.askDate === "yes" && !values[dateFieldName]) {
      return `Enter a ${fullDateLabel}`;
    }

    return undefined;
  };
}

export function SetDate({
  dateFieldName,
  fullDateLabel,
  shortDateLabel,
}: DateFormProps): ReactElement {
  const { values } = useFormikContext<DateFormValues>();
  const validateRadio = createValidateRadio(values, dateFieldName, fullDateLabel);

  return (
    <div>
      <div>
        <Field
          type="radio"
          id="no"
          name="askDate"
          value="no"
          validate={validateRadio}
        />
        <label htmlFor="no">No {shortDateLabel}</label>
      </div>
      <div>
        <Field
          type="radio"
          id="yes"
          name="askDate"
          value="yes"
        />
        <label htmlFor="yes">Yes, let me specify a {shortDateLabel}</label>
        {values.askDate === "yes" && (
          <div>
            <label htmlFor="set-date">Please specify date</label>
            <Field
              type="date"
              id="set-date"
              name={dateFieldName}
            />
          </div>
        )}
      </div>
    </div>
  );
}
