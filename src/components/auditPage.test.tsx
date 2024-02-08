/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises from "../tests/utils";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import AuditPage from "./auditPage";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

const auditLogsList = [
    {
        id: "602fb3250003c61e92b25da0",
        timestamp: "Fri Feb 19 2021 12:46:29 GMT+0000 (Greenwich Mean Time)",
        message: "Successfully uninstalled questionnaire OPN2012K",
        severity: "INFO"
    }
];

const auditLogsList2 = [
    {
        id: "602fb3250003c61e92b25da0",
        timestamp: "Fri Feb 19 2021 12:47:29 GMT+0000 (Greenwich Mean Time)",
        message: "Successfully installed questionnaire OPN2012K",
        severity: "INFO"
    }
];

describe("Audit Logs page", () => {
    beforeEach(() => {
        mock.onGet("/api/audit").reply(200, auditLogsList);
    });

    afterEach(() => {
        mock.reset();
    });

    it("view Audit Logs page matches Snapshot", async () => {
        const wrapper = render(
            <MemoryRouter initialEntries={["/"]}>
                <AuditPage />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        const { getByText, queryByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <AuditPage />
            </MemoryRouter>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Questionnaire deployment history/i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(getByText(/Questionnaire deployment history/i)).toBeDefined();
            expect(getByText(/Successfully uninstalled questionnaire OPN2012K/i)).toBeDefined();
            expect(getByText(/19\/02\/2021 12:46:29/i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });

    it("should refresh the list when you press the Reload logs button", async () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <AuditPage />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(getByText(/Successfully uninstalled questionnaire OPN2012K/i)).toBeDefined();
            expect(getByText(/19\/02\/2021 12:46:29/i)).toBeDefined();
        });

        mock.onGet("/api/audit").reply(200, auditLogsList2);

        userEvent.click(screen.getByText("Reload"));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(getByText(/Successfully installed questionnaire OPN2012K/i)).toBeDefined();
            expect(getByText(/19\/02\/2021 12:47:29/i)).toBeDefined();
        });
    });
});

describe("Given the API returns a 500 status", () => {
    beforeEach(() => {
        mock.onGet("/api/audit").reply(500, []);
    });

    afterEach(() => {
        mock.reset();
    });

    it("it should render with the error message displayed", async () => {
        const { getByText, queryByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <AuditPage />
            </MemoryRouter>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Unable to load deployment history./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });
});

describe("Given the API returns malformed json", () => {
    beforeEach(() => {
        mock.onGet("/api/audit").reply(500, { text: "Hello" });
    });

    afterEach(() => {
        mock.reset();
    });

    it("it should render with the error message displayed", async () => {
        const { getByText, queryByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <AuditPage />
            </MemoryRouter>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Unable to load deployment history./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });
});

describe("Given the API returns an empty list", () => {
    beforeEach(() => {
        mock.onGet("/api/audit").reply(200, []);
    });

    afterEach(() => {
        mock.reset();
    });

    it("it should render with a message to inform the user in the list", async () => {
        const { getByText, queryByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <AuditPage />
            </MemoryRouter>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/No recent deployment history found./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });
});
