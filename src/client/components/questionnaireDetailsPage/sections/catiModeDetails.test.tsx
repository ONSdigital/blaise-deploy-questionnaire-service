import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react-dom/test-utils";

import flushPromises from "../../../test-utils/flushPromises";
import { createWrapper } from "../../../test-utils/renderWithQueryClient";

import { CatiModeDetails } from "./catiModeDetails";

const mock = new MockAdapter(axios);

describe("CATI mode details", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should not render for non-CATI questionnaires", async () => {
    const { container } = render(
      <CatiModeDetails
        questionnaireName={"OPN2101A"}
        modes={["CAWI"]}
      />,
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });

  it("should display an error message when it fails to load the TO Start Date", async () => {
    const viewToStartDateFailedMessage = /Failed to get Telephone Operations start date/i;

    mock.onGet("/api/tostartdate/OPN2101A").reply(500);
    render(
      <CatiModeDetails
        questionnaireName={"OPN2101A"}
        modes={["CATI"]}
      />,
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(viewToStartDateFailedMessage)).toBeDefined();
    });
  });
});
