import { StyledFormField } from "blaise-design-system-react-components";
import { useFormikContext } from "formik";
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
    <StyledFormField
      name="askDate"
      type="radio"
      autoFocus
      validate={validateRadio}
      radioOptions={[
        {
          id: "no",
          label: `No ${shortDateLabel}`,
          value: "no",
        },
        {
          id: "yes",
          label: `Yes, let me specify a ${shortDateLabel}`,
          value: "yes",
          specifyOption: {
            type: "date",
            id: "set-date",
            name: dateFieldName,
            description: "Please specify date",
          },
        },
      ]}
    />
  );
}
