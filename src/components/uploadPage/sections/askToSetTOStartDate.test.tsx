/**
 * @jest-environment jsdom
 */

import navigateToDeployPageAndSelectFile, { mock_fetch_requests } from "../../../features/step_definitions/helpers/functions";
import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { instrumentList } from "../../../features/step_definitions/helpers/apiMockObjects";
import flushPromises from "../../../tests/utils";
import userEvent from "@testing-library/user-event";


import { AuthManager } from "blaise-login-react-client";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

const mock_server_responses = (url: string) => {
    console.log(url);
    if (url.includes("/api/instruments")) {
        return Promise.resolve({
            status: 404,
            json: () => Promise.resolve(),
        });
    } else if (url.includes("/upload/verify")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({ name: "OPN2004A.bpkg" }),
        });
    } else {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(instrumentList),
        });
    }
};

describe("Ask to set TO start date page", () => {

    beforeEach(() => {
        mock_fetch_requests(mock_server_responses);
    });

    it("should come up with a error panel if you don't pick an option", async () => {
        await navigateToDeployPageAndSelectFile();

        userEvent.click(screen.getByText(/Continue/));

        await act(async () => {
            await flushPromises();
        });

        userEvent.click(screen.getByText(/Continue/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.queryAllByText("Select an option")).toHaveLength(2);
        });
    });

    it("should come up with a error panel if pick set to set a start date but don't enter one", async () => {
        await navigateToDeployPageAndSelectFile();

        userEvent.click(screen.getByText(/Continue/));

        await act(async () => {
            await flushPromises();
        });

        userEvent.click(screen.getByText(/Yes, let me specify a start date/i));
        userEvent.click(screen.getByText(/Continue/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.queryAllByText("Enter a start date")).toHaveLength(2);
        });
    });

    it("should show selected date on the summary page", async () => {
        await navigateToDeployPageAndSelectFile();

        userEvent.click(screen.getByText(/Continue/));

        await act(async () => {
            await flushPromises();
        });

        userEvent.click(screen.getByText(/Yes, let me specify a start date/i));

        fireEvent.change(screen.getByLabelText(/Please specify date/i), { target: { value: "2030-06-05" } });

        userEvent.click(screen.getByText(/Continue/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Deployment summary/i)).toBeDefined();
            expect(screen.getByText(/Start date set to 05\/06\/2030/i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
