/**
 * @jest-environment jsdom
 */

import { clickContinue, navigateToDeployPageAndSelectFile } from "../../../features/step_definitions/helpers/functions";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import flushPromises from "../../../tests/utils";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

import { Authenticate } from "blaise-login-react/blaise-login-react-client";

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

describe("Ask to set TO start date page", () => {
    beforeEach(() => {
        mock.onGet("/api/questionnaires/OPN2004A").reply(404);
        mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(200, { name: "OPN2004A.bpkg" });
    });

    afterEach(() => {
        mock.reset();
    });

    it("should come up with a error panel if you don't pick an option", async () => {
        await navigateToDeployPageAndSelectFile();
        await clickContinue();

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
        await clickContinue();

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
        await clickContinue();

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
});
