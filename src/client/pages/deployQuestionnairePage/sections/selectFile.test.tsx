import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { type ReactElement, useState } from "react";
import { MemoryRouter } from "react-router-dom";

import { SelectFile } from "./selectFile";

function TestHost(): ReactElement {
  const [file, setFile] = useState<File | undefined>();

  return (
    <MemoryRouter>
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <SelectFile
              file={file}
              setFile={setFile}
              loading={false}
            />
            <button type="submit">Submit</button>
          </form>
        )}
      </Formik>
    </MemoryRouter>
  );
}

describe("SelectFile", () => {
  it("stores the selected file in the picker input", async () => {
    render(<TestHost />);

    const input = screen.getByLabelText(/Select questionnaire package/i) as HTMLInputElement;
    const file = new File(["content"], "DST2304Z.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);

    expect(input.files).toHaveLength(1);
    expect(input.files?.[0].name).toEqual("DST2304Z.bpkg");
    expect(input.value).toContain("DST2304Z.bpkg");
  });

  it("shows a required error when the file selection is cleared", () => {
    render(<TestHost />);

    const input = screen.getByLabelText(/Select questionnaire package/i);

    fireEvent.change(input, {
      target: {
        files: null,
      },
    });

    expect(document.getElementById("survey-selector-error")).toHaveTextContent("Select a file");
  });

  it("shows a file type error for non-bpkg uploads", () => {
    render(<TestHost />);

    const input = screen.getByLabelText(/Select questionnaire package/i) as HTMLInputElement;
    const file = new File(["content"], "DST2304Z.txt", { type: "text/plain" });

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(document.getElementById("survey-selector-error")).toHaveTextContent(
      "File must be a .bpkg",
    );
  });

  it("treats multiple selected files as invalid", () => {
    render(<TestHost />);

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const firstFile = new File(["first"], "DST2304Z.bpkg", { type: "application/octet-stream" });
    const secondFile = new File(["second"], "DST2305Z.bpkg", { type: "application/octet-stream" });

    fireEvent.change(input, {
      target: {
        files: [firstFile, secondFile],
      },
    });

    expect(document.getElementById("survey-selector-error")).toHaveTextContent("Select a file");
  });
});
