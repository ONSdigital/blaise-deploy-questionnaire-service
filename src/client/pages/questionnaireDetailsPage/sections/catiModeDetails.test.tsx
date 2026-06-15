import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react";
import { MemoryRouter } from "react-router-dom";

import flushPromises from "../../../test-utils/flushPromises";
import { createWrapper } from "../../../test-utils/renderWithQueryClient";

import { CatiModeDetails } from "./catiModeDetails";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("CATI mode details", () => {
  afterEach(() => {
    mock.reset();
  });

  function renderWithRouter(questionnaireName: string, modes: string[]) {
    return render(
      <MemoryRouter>
        <CatiModeDetails
          questionnaireName={questionnaireName}
          modes={modes}
        />
      </MemoryRouter>,
      { wrapper: createWrapper() },
    );
  }

  it("renders the Telephone Operations start date summary row with legacy classes when no date is set", async () => {
    mock.onGet("/api/tostartdate/OPN2101A").reply(200, { tostartdate: "" });

    renderWithRouter("OPN2101A", ["CATI"]);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      const summaryItem = document.querySelector("div.ons-summary__item");
      const summaryValue = document.querySelector("div.ons-summary__item span.ons-summary__text");

      expect(summaryItem).not.toBeNull();
      expect(screen.getByText("Telephone Operations start date")).toBeDefined();
      expect(summaryValue?.textContent).toContain("No start date specified, using survey days");
    });
  });

  it("renders a formatted Telephone Operations start date value when one is present", async () => {
    mock.onGet("/api/tostartdate/OPN2101A").reply(200, { tostartdate: "2026-06-01" });

    renderWithRouter("OPN2101A", ["CATI"]);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      const summaryValue = document.querySelector("div.ons-summary__item span.ons-summary__text");

      expect(summaryValue?.textContent).toContain("01/06/2026");
      expect(
        screen.getByRole("link", { name: /change or delete telephone operations start date/i }),
      ).toBeDefined();
    });
  });

  it("should not render for non-CATI questionnaires", async () => {
    const { container } = renderWithRouter("OPN2101A", ["CAWI"]);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });

  it("should display an error message when it fails to load the Telephone Operations start date", async () => {
    const viewToStartDateFailedMessage = /Failed to get Telephone Operations start date/i;

    mock.onGet("/api/tostartdate/OPN2101A").reply(500);
    renderWithRouter("OPN2101A", ["CATI"]);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(viewToStartDateFailedMessage)).toBeDefined();
    });
  });
});
