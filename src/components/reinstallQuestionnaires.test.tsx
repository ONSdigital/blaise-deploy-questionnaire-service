/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises from "../tests/utils";
import { act } from "react-dom/test-utils";
import { BrowserRouter, RouterProvider, createMemoryRouter } from "react-router-dom";
import { Questionnaire } from "blaise-api-node-client";
import ReinstallQuestionnaires from "./reinstallQuestionnaires";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

const questionnaireList: Questionnaire[] = [{
    name: "OPN2101A",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "January 2021"
}];

const bucketQuestionnaire: string[] = ["OPN2101A.bpkg", "OPN2004A.bpkg", "LMS2101_BK2.bpkg"];

describe("Reinstall questionnaires list", () => {
    beforeEach(() => {
        mock.onGet("/api/questionnaires").reply(200, questionnaireList);
        mock.onGet("/bucket/files").reply(200, bucketQuestionnaire);
    });

    afterEach(() => {
        mock.reset();
    });

    it("view Blaise Status page matches Snapshot", async () => {
        const wrapper = render(<ReinstallQuestionnaires />, { wrapper: BrowserRouter });

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
            expect(wrapper);
        });
    });

    it("should render correctly", async () => {
        render(<ReinstallQuestionnaires />, { wrapper: BrowserRouter });

        await act(async () => {
            await flushPromises();
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
            expect(screen.getByText(/OPN2004A/i)).toBeDefined();
            expect(screen.getByText(/LMS2101_BK2/i)).toBeDefined();
            expect(screen.queryByText(/OPN2101A/i)).not.toBeInTheDocument();
        });
    });

    it("should render a message if all items in bucket are already installed", async () => {
        const questionnaireList: any[] = [{ name: "OPN2101A" }, { name: "OPN2004A" }, { name: "LMS2101_BK2" }];

        mock.onGet("/api/questionnaires").reply(200, questionnaireList);

        render(<ReinstallQuestionnaires />, { wrapper: BrowserRouter });

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
            expect(screen.getByText(/No compatible previously installed questionnaires found./i)).toBeDefined();
        });
    });
});

describe("Reinstall questionnaires", () => {
    beforeEach(() => {
        mock.onGet("/api/questionnaires").reply(200, []);
        mock.onGet("/bucket/files").reply(200, bucketQuestionnaire);
        mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(200, { name: "OPN2004A.bpkg" });
        mock.onPost("/api/install").reply(201);
    });

    afterEach(() => {
        mock.reset();
    });

    it("should redirect to the success page after install", async () => {
        const routes = [
            {
                path: "/reinstall",
                element: <ReinstallQuestionnaires />
            }
        ];

        const router = createMemoryRouter(routes, {
            initialEntries: ["/reinstall"],
            initialIndex: 0,
        });

        render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/OPN2004A/i));
            await flushPromises();
            fireEvent.click(screen.getByText(/Install selected questionnaire/i));
            await flushPromises();
        });

        await waitFor(() => {
            // Check page has been redirected to summary page
            expect(router.state.location.pathname).toEqual("/UploadSummary");
            // State should be blank as its successful
            expect(router.state.location.state).toEqual({ questionnaireName: "OPN2004A", status: "" });
        });
    });

    it("should render a message if all items in bucket are already installed", async () => {
        const questionnaireList: any[] = [{ name: "OPN2101A" }, { name: "OPN2004A" }, { name: "LMS2101_BK2" }];

        mock.onGet("/api/questionnaires").reply(200, questionnaireList);

        render(<ReinstallQuestionnaires />, { wrapper: BrowserRouter });

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
            expect(screen.getByText(/No compatible previously installed questionnaires found./i)).toBeDefined();
        });
    });
});

describe("Given the API returns a 500 status", () => {
    beforeEach(() => {
        mock.onGet("/api/questionnaires").reply(500);
    });

    afterEach(() => {
        mock.reset();
    });

    it("it should render with the error message displayed", async () => {
        render(<ReinstallQuestionnaires />, { wrapper: BrowserRouter });

        await waitFor(() => {
            expect(screen.getByText(/Unable to load questionnaires./i)).toBeDefined();
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });
});

describe("Given the API returns an empty list", () => {
    beforeEach(() => {
        mock.onGet("/api/questionnaires").reply(200, []);
        mock.onGet("/bucket/files").reply(200, []);
    });

    afterEach(() => {
        mock.reset();
    });

    it("it should render with a message to inform the user in the list", async () => {
        render(<ReinstallQuestionnaires />, { wrapper: BrowserRouter });

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
            expect(screen.getByText(/No compatible previously installed questionnaires found./i)).toBeDefined();
        });
    });
});
