import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { createWrapper } from "../../../test-utils/renderWithQueryClient";

import { DeleteConfirmation } from "./deleteConfirmation";

import type { Questionnaire } from "blaise-api-node-client";

const mockHttp = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("DeleteConfirmation", () => {
  const CATI_WARNING_MESSAGE = "Questionnaire has active survey days";
  const CAWI_WARNING_MESSAGE = "Questionnaire is active for web collection";

  const defaultQuestionnaire: Questionnaire = {
    fieldPeriod: "",
    installDate: "",
    name: "",
    serverParkName: "",
  };

  beforeEach(() => {
    mockHttp.reset();
  });

  describe("when CAWI mode is include", () => {
    it("should display CAWI warning for an active CAWI questionnaire", async () => {
      const questionnaire: Questionnaire = {
        ...defaultQuestionnaire,
        status: "ACTIVE",
      };

      const view = render(
        <DeleteConfirmation
          modes={["CAWI"]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );

      expect(await screen.findByText(CAWI_WARNING_MESSAGE)).toBeVisible();
      expect(screen.queryByText("Loading")).toBeNull();
      expect(view).toMatchSnapshot();
    });

    it("should not display CAWI warning for an inactive CAWI questionnaire", async () => {
      const questionnaire: Questionnaire = {
        ...defaultQuestionnaire,
        status: "inactive",
      };

      render(
        <DeleteConfirmation
          modes={["CAWI"]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );
      await screen.findByText(/Are you sure you want to delete/);

      expect(screen.queryByText(CAWI_WARNING_MESSAGE)).toBeNull();
      expect(screen.queryByText("Loading")).toBeNull();
    });

    it("should not display CAWI warning for an active non-CAWI questionnaire", async () => {
      const questionnaire: Questionnaire = {
        ...defaultQuestionnaire,
        status: "active",
      };

      render(
        <DeleteConfirmation
          modes={["OTHER"]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );

      expect(screen.queryByText(CAWI_WARNING_MESSAGE)).toBeNull();
      expect(screen.queryByText("Loading")).toBeNull();
    });
  });

  describe("when CATI mode is present", () => {
    it("should display the loading page while waiting for the CATI status", async () => {
      const questionnaire: Questionnaire = {
        ...defaultQuestionnaire,
        name: "LMS2201_AA1",
        status: "active",
      };

      mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, true);

      const view = render(
        <DeleteConfirmation
          modes={["CATI"]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );

      expect(screen.getByText(/Loading/i)).toBeVisible();
      expect(view).toMatchSnapshot();

      await screen.findByText(CATI_WARNING_MESSAGE);
    });

    it("should display the CATI warning for an active CATI questionnaire", async () => {
      const questionnaire: Questionnaire = {
        ...defaultQuestionnaire,
        name: "LMS2201_AA1",
        status: "active",
      };

      mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, true);

      const view = render(
        <DeleteConfirmation
          modes={["CATI"]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );

      expect(await screen.findByText(/Questionnaire has active survey days/i)).toBeVisible();
      expect(view).toMatchSnapshot();
    });

    it("should not fetch the active status more than once", async () => {
      const questionnaire: Questionnaire = {
        ...defaultQuestionnaire,
        name: "LMS2201_AA1",
        status: "active",
      };

      mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, true);

      const { rerender } = render(
        <DeleteConfirmation
          modes={["CATI"]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );

      expect(await screen.findByText(CATI_WARNING_MESSAGE)).toBeVisible();
      rerender(
        <DeleteConfirmation
          modes={["CATI"]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(mockHttp.history.get.length).toBe(1);
    });

    it("should not display the CATI warning for an inactive CATI questionnaire", async () => {
      const questionnaire: Questionnaire = {
        ...defaultQuestionnaire,
        name: "LMS2201_AA1",
        status: "not-active",
      };

      mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, true);

      render(
        <DeleteConfirmation
          modes={["CATI"]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );
      await screen.findByText(/Are you sure you want to delete/);

      expect(screen.queryByText(CATI_WARNING_MESSAGE)).toBeNull();
    });

    it("should not display the CATI warning for an inactive request CATI questionnaire", async () => {
      const questionnaire: Questionnaire = {
        ...defaultQuestionnaire,
        name: "LMS2201_AA1",
        status: "active",
      };

      mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, false);

      render(
        <DeleteConfirmation
          modes={["CATI"]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );
      await screen.findByText(/Are you sure you want to delete/);

      expect(screen.queryByText(CATI_WARNING_MESSAGE)).toBeNull();
    });

    it("should not display the CATI warning for an active non-CATI questionnaire", async () => {
      const questionnaire: Questionnaire = {
        ...defaultQuestionnaire,
        name: "LMS2201_AA1",
        status: "active",
      };

      mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, true);

      render(
        <DeleteConfirmation
          modes={["OTHER"]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );
      await screen.findByText(/Are you sure you want to delete/);

      expect(screen.queryByText(CATI_WARNING_MESSAGE)).toBeNull();
    });

    it("should display an error when the CATI active check fails", async () => {
      const questionnaire: Questionnaire = {
        ...defaultQuestionnaire,
        name: "LMS2201_AA1",
        status: "active",
      };

      mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(500);

      const view = render(
        <DeleteConfirmation
          modes={["CATI"]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );

      expect(
        await screen.findByText(/Could not get warning details, please try again/i),
      ).toBeVisible();
      expect(view).toMatchSnapshot();
    });
  });

  describe("when the Cancel button is pressed", () => {
    it("should call onCancel on cancel", async () => {
      const onCancel = vi.fn();
      const onDelete = vi.fn();

      render(
        <DeleteConfirmation
          modes={[]}
          questionnaire={defaultQuestionnaire}
          onDelete={onDelete}
          onCancel={onCancel}
        />,
        { wrapper: createWrapper() },
      );

      const cancel = await screen.findByRole("button", { name: "Cancel" });

      await userEvent.click(cancel);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe("when Delete button is pressed", () => {
    const questionnaire = { ...defaultQuestionnaire, name: "LMS2210_CC1" };

    beforeEach(() => {
      mockHttp.onDelete("/api/tostartdate/LMS2210_CC1").reply(204);
      mockHttp.onDelete("/api/tmreleasedate/LMS2210_CC1").reply(204);
      mockHttp.onDelete("/api/questionnaires/LMS2210_CC1").reply(204);
    });

    it("should delete the Telephone Operations start date, Totalmobile release date and questionnaire on confirm", async () => {
      render(
        <DeleteConfirmation
          modes={[]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );

      const confirm = await screen.findByRole("button", { name: "Delete" });

      await userEvent.click(confirm);

      await waitFor(() => {
        expect(mockHttp.history.delete.length).toBe(3);
      });
      expect(mockHttp.history.delete[0].url).toBe("/api/tostartdate/LMS2210_CC1");
      expect(mockHttp.history.delete[1].url).toBe("/api/tmreleasedate/LMS2210_CC1");
      expect(mockHttp.history.delete[2].url).toBe("/api/questionnaires/LMS2210_CC1");
    });

    it("should set the status", async () => {
      const onDelete = vi.fn();
      const onCancel = vi.fn();

      render(
        <DeleteConfirmation
          modes={[]}
          questionnaire={questionnaire}
          onDelete={onDelete}
          onCancel={onCancel}
        />,
        { wrapper: createWrapper() },
      );

      const confirm = await screen.findByRole("button", { name: "Delete" });

      await userEvent.click(confirm);
      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith("Questionnaire: LMS2210_CC1 Successfully deleted");
      });

      expect(onCancel).not.toHaveBeenCalled();
    });

    it("should display an error if deleting Telephone Operations start date fails", async () => {
      mockHttp.onDelete("/api/tostartdate/LMS2210_CC1").reply(500);
      const view = render(
        <DeleteConfirmation
          modes={[]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );

      const confirm = await screen.findByRole("button", { name: "Delete" });

      await userEvent.click(confirm);

      expect(
        await screen.findByText(/Failed to delete Telephone Operations start date/i),
      ).toBeVisible();
      await waitFor(() => {
        expect(mockHttp.history.delete.length).toBe(1);
      });
      expect(view).toMatchSnapshot();
    });

    it("should display an error if deleting Totalmobile release date fails", async () => {
      mockHttp.onDelete("/api/tmreleasedate/LMS2210_CC1").reply(500);
      render(
        <DeleteConfirmation
          modes={[]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );

      const confirm = await screen.findByRole("button", { name: "Delete" });

      await userEvent.click(confirm);

      expect(await screen.findByText(/Failed to delete Totalmobile release date/)).toBeVisible();
      expect(mockHttp.history.delete.length).toBe(2);
    });

    it("should display an error if deleting questionnaire fails", async () => {
      mockHttp.onDelete("/api/questionnaires/LMS2210_CC1").reply(500);
      render(
        <DeleteConfirmation
          modes={[]}
          questionnaire={questionnaire}
          onDelete={() => {}}
          onCancel={() => {}}
        />,
        { wrapper: createWrapper() },
      );

      const confirm = await screen.findByRole("button", { name: "Delete" });

      await userEvent.click(confirm);

      expect(await screen.findByText(/Failed to delete the questionnaire/)).toBeVisible();
      expect(mockHttp.history.delete.length).toBe(3);
    });
  });
});
