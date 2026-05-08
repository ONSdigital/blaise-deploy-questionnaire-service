/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { useState, type ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

import SelectFile from "./selectFile";

function TestHost(): ReactElement {
  const [file, setFile] = useState<File | undefined>();

  return (
    <MemoryRouter>
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
        <SelectFile
          file={file}
          setFile={setFile}
          loading={false}
        />
      </Formik>
    </MemoryRouter>
  );
}

describe("SelectFile", () => {
  it("stores the selected file in the picker input", async () => {
    render(<TestHost />);

    const input = screen.getByLabelText(/Select survey package/i) as HTMLInputElement;
    const file = new File(["content"], "DST2304Z.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);

    expect(input.files).toHaveLength(1);
    expect(input.files?.[0].name).toEqual("DST2304Z.bpkg");
    expect(input.value).toContain("DST2304Z.bpkg");
  });
});
