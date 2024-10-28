/**
 * @jest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import flushPromises from "../tests/utils";
import { render, waitFor, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import QuestionnaireList from "./questionnaireList";
import userEvent from "@testing-library/user-event";

const mock = new MockAdapter(axios);

// Mock the blaise-login-react Authenticate component
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

const MOCK_QUESTIONNAIRE_LIST = [
    {
        "name": "IPS2409A",
        "id": "ef8980d9-5f5c-416d-9b4b-9570c15c85c0",
        "serverParkName": "gusty",
        "installDate": "2024-10-16T13:14:01.7557563+01:00",
        "status": "Active",
        "dataRecordCount": 1,
        "hasData": true,
        "blaiseVersion": "5.14.4.3668",
        "nodes": [
            {
                "nodeName": "blaise-gusty-mgmt",
                "nodeStatus": "Active"
            }
        ],
        "fieldPeriod": "September 2024"
    },
    {
        "name": "IPS2409B",
        "id": "ef8980d9-5f5c-416d-9b4b-9570c15c85c0",
        "serverParkName": "gusty",
        "installDate": "2024-10-16T13:14:01.7557563+01:00",
        "status": "Active",
        "dataRecordCount": 1,
        "hasData": true,
        "blaiseVersion": "5.14.4.3668",
        "nodes": [
            {
                "nodeName": "blaise-gusty-mgmt",
                "nodeStatus": "Active"
            }
        ],
        "fieldPeriod": "September 2024"
    },
    {
        "name": "IPS_ContactInfo",
        "id": "10effca3-caec-4fc0-a037-20a43cf050c2",
        "serverParkName": "gusty",
        "installDate": "2024-10-18T12:59:23.4164608+01:00",
        "status": "Active",
        "dataRecordCount": 0,
        "hasData": false,
        "blaiseVersion": "5.14.4.3668",
        "nodes": [
            {
                "nodeName": "blaise-gusty-mgmt",
                "nodeStatus": "Active"
            }
        ],
        "fieldPeriod": "Field period unknown"
    },
    {
        "name": "IPS_Attempts",
        "id": "10effca3-caec-4fc0-a037-20a43cf050c4",
        "serverParkName": "gusty",
        "installDate": "2024-10-18T12:59:23.4164608+01:00",
        "status": "Active",
        "dataRecordCount": 0,
        "hasData": false,
        "blaiseVersion": "5.14.4.3668",
        "nodes": [
            {
                "nodeName": "blaise-gusty-mgmt",
                "nodeStatus": "Active"
            }
        ],
        "fieldPeriod": "Field period unknown"
    },
    {
        "name": "DST2304Z",
        "id": "10effca3-caec-4fc0-a037-20a43cf050c5",
        "serverParkName": "gusty",
        "installDate": "2024-10-18T12:59:23.4164608+01:00",
        "status": "Active",
        "dataRecordCount": 0,
        "hasData": false,
        "blaiseVersion": "5.14.4.3668",
        "nodes": [
            {
                "nodeName": "blaise-gusty-mgmt",
                "nodeStatus": "Active"
            }
        ],
        "fieldPeriod": "Field period unknown"
    }
]; 

describe("Questionnaire List displays valid user questionnaires", () => {
    beforeEach(() => {
        mock.onGet("/api/questionnaires").reply(200, MOCK_QUESTIONNAIRE_LIST);
    });

    afterEach(() => {
        mock.reset();
    });

    it("should not display any questionnaires if no questionnaires were fetched back from the server", async () => {
        // Arrange
        mock.onGet("/api/questionnaires").reply(200, []);
        render(
            <MemoryRouter initialEntries={["/questionnaire/"]}>
                <QuestionnaireList setErrored={jest.fn()} />
            </MemoryRouter >
        );

        // Act
        await act(async () => {
            await flushPromises();
        });

        // Assert
        await waitFor(() => {
            expect(screen.getByText(/Filter by questionnaire name/i)).toBeVisible();
            expect(screen.getByText(/No installed questionnaires found/i)).toBeVisible();
        });
    });

    it("should display a list of questionnaires containing only questionnaires that match the filter", async () => {
        // Arrange
        render(
            <MemoryRouter initialEntries={["/questionnaire/"]}>
                <QuestionnaireList setErrored={jest.fn()} />
            </MemoryRouter >
        );

        // Act
        await act(async () => {
            await flushPromises();
        });
        const filterInput = screen.getByTestId(/filter-by-name/i);
        userEvent.type(filterInput, "IPS2409A");

        // Assert
        await waitFor(() => {
            expect(screen.getByText(/Filter by questionnaire name/i)).toBeVisible();
            expect(screen.getByText(/1 results of 1/i)).toBeVisible();
            expect(screen.getByText(/IPS2409A/i)).toBeVisible();
        });
    });

});

describe("Questionnaire List displays hidden questionnaires that match when using the search filter", () => {
    beforeEach(() => {
        mock.onGet("/api/questionnaires").reply(200, MOCK_QUESTIONNAIRE_LIST);
    });

    afterEach(() => {
        mock.reset();
    });

    it("should display the hidden ContactInfo questionnaire", async () => {
        // Arrange
        render(
            <MemoryRouter initialEntries={["/questionnaire/"]}>
                <QuestionnaireList setErrored={jest.fn()} />
            </MemoryRouter >
        );

        // Act
        await act(async () => {
            await flushPromises();
        });
        const filterInput = screen.getByTestId(/filter-by-name/i);
        userEvent.type(filterInput, "ContactInfo");

        // Assert
        await waitFor(() => {
            expect(screen.getByText(/Filter by questionnaire name/i)).toBeVisible();
            expect(screen.getByText(/1 results of 1/i)).toBeVisible();
            expect(screen.getByText(/IPS_ContactInfo/i)).toBeVisible();
        });
    });

    it("should display the hidden Attempts questionnaire", async () => {
        // Arrange
        render(
            <MemoryRouter initialEntries={["/questionnaire/"]}>
                <QuestionnaireList setErrored={jest.fn()} />
            </MemoryRouter >
        );

        // Act
        await act(async () => {
            await flushPromises();
        });
        const filterInput = screen.getByTestId(/filter-by-name/i);
        userEvent.type(filterInput, "Attempts");

        // Assert
        await waitFor(() => {
            expect(screen.getByText(/Filter by questionnaire name/i)).toBeVisible();
            expect(screen.getByText(/1 results of 1/i)).toBeVisible();
            expect(screen.getByText(/IPS_Attempts/i)).toBeVisible();
        });
    });
    
    it("should display the hidden DST2304Z test questionnaire", async () => {
        // Arrange
        render(
            <MemoryRouter initialEntries={["/questionnaire/"]}>
                <QuestionnaireList setErrored={jest.fn()} />
            </MemoryRouter >
        );

        // Act
        await act(async () => {
            await flushPromises();
        });
        const filterInput = screen.getByTestId(/filter-by-name/i);
        userEvent.type(filterInput, "DST2304Z");

        // Assert
        await waitFor(() => {
            expect(screen.getByText(/Filter by questionnaire name/i)).toBeVisible();
            expect(screen.getByText(/1 results of 1/i)).toBeVisible();
            expect(screen.getByText(/DST2304Z/i)).toBeVisible();
        });
    });
});
