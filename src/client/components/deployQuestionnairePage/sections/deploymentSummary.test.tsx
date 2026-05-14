import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Formik } from "formik";

import { questionnaireWithName } from "../../../features/step_definitions/helpers/api.mock";
import { MockAuthenticate } from "../../../test-utils/authenticate.mock";

import { DeploymentSummary } from "./deploymentSummary";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

describe("Deployment summary", () => {
  const lmsQuestionnaireName = "LMS2004A";
  const dstQuestionnaireName = "DST2004A";
  const opnQuestionnaireName = "OPN2004A";
  const lastModified = new Date("2022-01-24T01:02:03").getTime();

  const validFiles = [
    {
      file: new File(["龴ↀ◡ↀ龴"], `${lmsQuestionnaireName}.bpkg`, {
        type: "application/pdf",
        lastModified,
      }),
      questionnaire: questionnaireWithName(lmsQuestionnaireName),
    },
    {
      file: new File(["(♥_♥)"], `${dstQuestionnaireName}.bpkg`, {
        type: "application/pdf",
        lastModified,
      }),
      questionnaire: questionnaireWithName(dstQuestionnaireName),
    },
  ];

  const opnFile = new File(["(♥_♥)"], `${opnQuestionnaireName}.bpkg`, {
    type: "application/pdf",
    lastModified,
  });

  const opnQuestionnaire = questionnaireWithName(opnQuestionnaireName);

  validFiles.forEach(({ file, questionnaire }) => {
    it(`should match thesnapshotfor ${file.name}`, async () => {
      const wrapper = render(
        <Formik
          initialValues={{}}
          onSubmit={() => {}}
        >
          <DeploymentSummary
            file={file}
            foundQuestionnaire={questionnaire}
          />
        </Formik>,
      );

      expect(wrapper).toMatchSnapshot();
    });
  });

  validFiles.forEach(({ file, questionnaire }) => {
    it(`should display the questionnaire file name for ${file.name}`, async () => {
      const { getByText } = render(
        <Formik
          initialValues={{}}
          onSubmit={() => {}}
        >
          <DeploymentSummary
            file={file}
            foundQuestionnaire={questionnaire}
          />
        </Formik>,
      );

      expect(getByText(/Questionnaire file name/i)).toBeInTheDocument();
    });
  });

  it("should display when the file was last modified", async () => {
    const { file, questionnaire } = validFiles[0];
    const { getByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <DeploymentSummary
          file={file}
          foundQuestionnaire={questionnaire}
        />
      </Formik>,
    );

    expect(getByText(/Questionnaire file last modified date/i)).toBeInTheDocument();
  });

  it("should display the questionnaire file size", async () => {
    const { file, questionnaire } = validFiles[0];
    const { getByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <DeploymentSummary
          file={file}
          foundQuestionnaire={questionnaire}
        />
      </Formik>,
    );

    expect(getByText(/Questionnaire file size/i)).toBeInTheDocument();
  });

  it("should display if the questionnaire exists in Blaise", async () => {
    const { file, questionnaire } = validFiles[0];
    const { getByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <DeploymentSummary
          file={file}
          foundQuestionnaire={questionnaire}
        />
      </Formik>,
    );

    expect(getByText(/Already exists/i)).toBeInTheDocument();
  });

  it("should display the Telephone Operations start date", async () => {
    const { file, questionnaire } = validFiles[0];
    const { getByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <DeploymentSummary
          file={file}
          foundQuestionnaire={questionnaire}
        />
      </Formik>,
    );

    expect(getByText(/Telephone Operations start date/i)).toBeInTheDocument();
  });

  validFiles.forEach(({ file, questionnaire }) => {
    it(`should display the totalmobile release date for ${file.name} questionnaires`, async () => {
      const { getByText } = render(
        <Formik
          initialValues={{}}
          onSubmit={() => {}}
        >
          <DeploymentSummary
            file={file}
            foundQuestionnaire={questionnaire}
          />
        </Formik>,
      );

      expect(getByText(/Totalmobile release date/i)).toBeInTheDocument();
    });
  });

  it("should not display the totalmobile release date for non-LMS, non-DST questionnaires", async () => {
    const { queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <DeploymentSummary
          file={opnFile}
          foundQuestionnaire={opnQuestionnaire}
        />
      </Formik>,
    );

    expect(queryByText(/Totalmobile release date/i)).not.toBeInTheDocument();
  });

  it("should display Telephone Operations start date for OPN questionnaires", async () => {
    const { getByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <DeploymentSummary
          file={opnFile}
          foundQuestionnaire={opnQuestionnaire}
        />
      </Formik>,
    );

    expect(getByText(/Telephone Operations start date/i)).toBeInTheDocument();
  });

  it("does not add date-specific rows when there is no selected file", async () => {
    const { getByText, queryByText } = render(
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <DeploymentSummary
          file={undefined}
          foundQuestionnaire={null}
        />
      </Formik>,
    );

    expect(getByText(/Already exists/i)).toBeInTheDocument();
    expect(queryByText(/Telephone Operations start date/i)).not.toBeInTheDocument();
    expect(queryByText(/Totalmobile release date/i)).not.toBeInTheDocument();
  });
});
