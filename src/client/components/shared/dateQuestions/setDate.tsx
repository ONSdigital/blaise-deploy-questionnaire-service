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

export function SetDate({
  dateFieldName,
  fullDateLabel,
  shortDateLabel,
}: DateFormProps): ReactElement {
  const { values } = useFormikContext<DateFormValues>();

  function validateRadio(value: string) {
    let error;

    if (!value) {
      error = "Select an option";
    } else if (values.askDate === "yes" && !values[dateFieldName]) {
      error = `Enter a ${fullDateLabel}`;
    }

    return error;
  }

  const field = {
    name: "askDate",
    type: "radio",
    autoFocus: true,
    validate: validateRadio,
    radioOptions: [
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
    ],
    props: {},
  };

  return <StyledFormField {...field} />;
}
