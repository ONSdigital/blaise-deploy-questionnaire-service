import React from "react";
import {render, waitFor, fireEvent, cleanup, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises, {mock_server_request_Return_JSON} from "../../tests/utils";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import {instrumentList, survey_list} from "../../features/step_definitions/API_Mock_Objects";
import navigateToDeployPageAndSelectFile, {
    mock_fetch_requests,
    navigatePastSettingTOStartDateAndStartDeployment
} from "../../features/step_definitions/functions";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import UploadPage from "./UploadPage";

const mock = new MockAdapter(axios, {onNoMatch: "throwException"});

describe("Upload Page", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, instrumentList);
    });

    it("select file page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <UploadPage/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();
        const {getByText, queryByText} = render(
            <Router history={history}>
                <UploadPage/>
            </Router>
        );

        await waitFor(() => {
            expect(getByText(/Deploy a questionnaire file/i)).toBeDefined();
            expect(getByText(/Select survey package/i)).toBeDefined();
            expect(queryByText(/Table of questionnaires/i)).not.toBeInTheDocument();
        });
    });

    it("should display a message if you dont select a file", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <UploadPage/>
            </Router>
        );

        await fireEvent.click(screen.getByText(/Continue/));

        await waitFor(() => {
            expect(screen.queryAllByText("Select a file")).toHaveLength(2);
        });
    });

    it("should display a message if select a file that is a .bpkg", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <UploadPage/>
            </Router>
        );

        const inputEl = screen.getByLabelText(/Select survey package/i);

        const file = new File(["(⌐□_□)"], "OPN2004A.pdf", {
            type: "pdf"
        });

        Object.defineProperty(inputEl, "files", {
            value: [file]
        });

        fireEvent.change(inputEl);

        await fireEvent.click(screen.getByText(/Continue/));

        await waitFor(() => {
            expect(screen.queryAllByText("File must be a .bpkg")).toHaveLength(2);
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
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
            json: () => Promise.resolve({name: "OPN2004A.bpkg"}),
        });
    } else {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(survey_list),
        });
    }
};


describe("Given the file fails to upload", () => {

    beforeEach(() => {
        mock.onPut("^/upload").reply(500,
            {},
        );
        mock_fetch_requests(mock_server_responses);
    });

    it("it should redirect to the summary page with an error", async () => {
        await navigateToDeployPageAndSelectFile();

        await fireEvent.click(screen.getByText(/Continue/));

        await navigatePastSettingTOStartDateAndStartDeployment();

        await waitFor(() => {
            expect(screen.getByText("File deploy failed")).toBeDefined();
            expect(screen.getByText(/Failed to upload questionnaire/i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
