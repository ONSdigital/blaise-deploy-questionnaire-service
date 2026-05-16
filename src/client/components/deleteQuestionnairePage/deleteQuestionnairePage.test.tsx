import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { getQuestionnaire, getQuestionnaireModes } from "../../api/questionnaires";
import { createWrapper } from "../../test-utils/renderWithQueryClient";

import DeleteQuestionnairePage from "./deleteQuestionnairePage";

const mockDeleteConfirmation = vi.fn();
const mockFailedStateWarning = vi.fn();

vi.mock("../../api/questionnaires", () => ({
  getQuestionnaire: vi.fn(),
  getQuestionnaireModes: vi.fn(),
}));

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

vi.mock("./sections/failedStateWarning", () => ({
  FailedStateWarning: (props: { questionnaireName: string }) => {
    mockFailedStateWarning(props);

    return <div>Failed state warning for {props.questionnaireName}</div>;
  },
}));

describe("DeleteQuestionnairePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockDeleteConfirmation.mockClear();
    mockFailedStateWarning.mockClear();
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
      { wrapper: createWrapper() },
    );

    expect(mockDeleteConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        questionnaire,
        modes: ["CAWI", "CATI"],
        onDelete,
        onCancel: expect.any(Function),
      }),
    );
    expect(mockFailedStateWarning).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancel deletion" }));

    expect(onCancel).toHaveBeenCalledWith("IPS0001A");
  });

  it("renders the failed-state warning flow for failed questionnaires", () => {
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
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Failed state warning for IPS0002A")).toBeVisible();
    expect(mockFailedStateWarning).toHaveBeenCalledWith({ questionnaireName: "IPS0002A" });
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
      { wrapper: createWrapper() },
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
      { wrapper: createWrapper() },
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel deletion" }));

    expect(mockDeleteConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        questionnaire: expect.objectContaining({ name: "", status: "" }),
        modes: [],
      }),
    );
    expect(onCancel).toHaveBeenCalledWith("");
  });

  it("fetches questionnaire details when opened directly by URL without location state", async () => {
    const onCancel = vi.fn();

    vi.mocked(getQuestionnaire).mockResolvedValue({ name: "IPS2605A", status: "Active" } as never);
    vi.mocked(getQuestionnaireModes).mockResolvedValue(["CAWI"]);

    render(
      <MemoryRouter initialEntries={["/questionnaire/IPS2605A/delete"]}>
        <Routes>
          <Route
            path="/questionnaire/:questionnaireName/delete"
            element={
              <DeleteQuestionnairePage
                onCancel={onCancel}
                onDelete={vi.fn()}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
      { wrapper: createWrapper() },
    );

    await screen.findByRole("button", { name: "Cancel deletion" });

    expect(getQuestionnaire).toHaveBeenCalledWith("IPS2605A");
    expect(getQuestionnaireModes).toHaveBeenCalledWith("IPS2605A");
    expect(mockDeleteConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        questionnaire: expect.objectContaining({ name: "IPS2605A", status: "Active" }),
        modes: ["CAWI"],
        onCancel: expect.any(Function),
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel deletion" }));

    expect(onCancel).toHaveBeenCalledWith("IPS2605A");
  });

  it("shows an error panel when fetching delete details fails", async () => {
    vi.mocked(getQuestionnaire).mockRejectedValueOnce(new Error("nope"));
    vi.mocked(getQuestionnaireModes).mockResolvedValueOnce(["CAWI"]);

    render(
      <MemoryRouter initialEntries={["/questionnaire/IPS2605A/delete"]}>
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
      { wrapper: createWrapper() },
    );

    expect(
      await screen.findByText(/Failed to get delete questionnaire confirmation details/i),
    ).toBeVisible();
  });

  it("redirects home when a questionnaire name is present but the questionnaire cannot be found", async () => {
    vi.mocked(getQuestionnaire).mockResolvedValueOnce(null as never);
    vi.mocked(getQuestionnaireModes).mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={["/questionnaire/IPS2605A/delete"]}>
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
          <Route
            path="/"
            element={<h1>Questionnaire list</h1>}
          />
        </Routes>
      </MemoryRouter>,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Questionnaire list/i })).toBeInTheDocument();
    });
  });
});
