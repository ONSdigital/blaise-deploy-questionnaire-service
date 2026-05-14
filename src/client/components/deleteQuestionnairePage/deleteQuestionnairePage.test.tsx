import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import DeleteQuestionnairePage from "./deleteQuestionnairePage";

const mockDeleteConfirmation = vi.fn();
const mockErroneousWarning = vi.fn();

vi.mock("./sections/deleteConfirmation", () => ({
  DeleteConfirmation: (props: {
    questionnaire: { name: string; status: string };
    modes: string[];
    onDelete: (status: string) => void;
    onCancel: () => void;
  }) => {
    mockDeleteConfirmation(props);

    return (
      <button
        type="button"
        onClick={props.onCancel}
      >
        Cancel deletion
      </button>
    );
  },
}));

vi.mock("./sections/erroneousWarning", () => ({
  ErroneousWarning: (props: { questionnaireName: string }) => {
    mockErroneousWarning(props);

    return <div>Erroneous warning for {props.questionnaireName}</div>;
  },
}));

describe("DeleteQuestionnairePage", () => {
  afterEach(() => {
    mockDeleteConfirmation.mockClear();
    mockErroneousWarning.mockClear();
  });

  it("renders the delete confirmation flow for non-failed questionnaires", () => {
    const onCancel = vi.fn();
    const onDelete = vi.fn();
    const questionnaire = { name: "IPS0001A", status: "Active" };

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/questionnaire/IPS0001A/delete",
            state: { questionnaire, modes: ["CAWI", "CATI"] },
          },
        ]}
      >
        <Routes>
          <Route
            path="/questionnaire/:questionnaireName/delete"
            element={
              <DeleteQuestionnairePage
                onCancel={onCancel}
                onDelete={onDelete}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(mockDeleteConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        questionnaire,
        modes: ["CAWI", "CATI"],
        onDelete,
        onCancel: expect.any(Function),
      }),
    );
    expect(mockErroneousWarning).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancel deletion" }));

    expect(onCancel).toHaveBeenCalledWith("IPS0001A");
  });

  it("renders the erroneous warning flow for failed questionnaires", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/questionnaire/IPS0002A/delete",
            state: {
              questionnaire: { name: "IPS0002A", status: "Failed" },
              modes: ["CAWI"],
            },
          },
        ]}
      >
        <Routes>
          <Route
            path="/questionnaire/:questionnaireName/delete"
            element={
              <DeleteQuestionnairePage
                onCancel={vi.fn()}
                onDelete={vi.fn()}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Erroneous warning for IPS0002A")).toBeVisible();
    expect(mockErroneousWarning).toHaveBeenCalledWith({ questionnaireName: "IPS0002A" });
    expect(mockDeleteConfirmation).not.toHaveBeenCalled();
  });

  it("falls back to the location questionnaire name when the route parameter is missing", () => {
    const onCancel = vi.fn();
    const questionnaire = { name: "IPS0003A", status: "Active" };

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/delete",
            state: { questionnaire, modes: ["CAWI"] },
          },
        ]}
      >
        <Routes>
          <Route
            path="/:questionnaireName?/delete"
            element={
              <DeleteQuestionnairePage
                onCancel={onCancel}
                onDelete={vi.fn()}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel deletion" }));

    expect(onCancel).toHaveBeenCalledWith("IPS0003A");
  });

  it("keeps rendering when both route params and location state are missing", () => {
    const onCancel = vi.fn();

    render(
      <MemoryRouter initialEntries={["/delete"]}>
        <Routes>
          <Route
            path="/:questionnaireName?/delete"
            element={
              <DeleteQuestionnairePage
                onCancel={onCancel}
                onDelete={vi.fn()}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel deletion" }));

    expect(mockDeleteConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        questionnaire: "",
        modes: "",
      }),
    );
    expect(onCancel).toHaveBeenCalledWith("");
  });
});