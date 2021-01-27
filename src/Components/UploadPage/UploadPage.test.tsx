import React from "react";
import Enzyme from "enzyme";
import {render, waitFor, fireEvent, cleanup, screen} from "@testing-library/react";
import Adapter from "enzyme-adapter-react-16";
import "@testing-library/jest-dom";
import flushPromises from "../../tests/utils";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import {instrumentList} from "../../features/step_definitions/API_Mock_Objects";
import UploadPage from "./UploadPage";
import uploader from "../../uploader";
import navigateToDeployPageAndSelectFile from "../../features/step_definitions/functions";

jest.mock("../../uploader");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
uploader.__setMockStatus(false);
// Mock the Uploader.js module
// jest.mock("../../uploader");

function mock_server_request(returnedStatus: number, returnedJSON: any) {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            status: returnedStatus,
            json: () => Promise.resolve(returnedJSON),
        })
    );
}

describe("Upload Page", () => {
    Enzyme.configure({adapter: new Adapter()});

    beforeAll(() => {
        mock_server_request(200, instrumentList);
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
        const {getByText, getByTestId} = render(
            <Router history={history}>
                <UploadPage/>
            </Router>
        );

        await fireEvent.click(getByTestId("button"));

        await waitFor(() => {
            expect(getByText(/You must select a file/i)).toBeDefined();
        });
    });

    it("should display a message if select a file that is not .zip or .bpkg", async () => {
        const history = createMemoryHistory();
        const {getByText, getByLabelText, getByTestId} = render(
            <Router history={history}>
                <UploadPage/>
            </Router>
        );

        const inputEl = getByLabelText(/Select survey package/i);

        const file = new File(["(⌐□_□)"], "OPN2004A.pdf", {
            type: "pdf"
        });

        Object.defineProperty(inputEl, "files", {
            value: [file]
        });

        fireEvent.change(inputEl);

        await fireEvent.click(getByTestId("button"));

        await waitFor(() => {
            expect(getByText(/File must be a .zip or .bpkg/i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});


describe("Given the file fails to upload", () => {
    Enzyme.configure({adapter: new Adapter()});

    beforeAll(() => {
        mock_server_request(200, instrumentList);
    });

    it("it should redirect to the summary page with an error", async () => {
        await navigateToDeployPageAndSelectFile();

        await fireEvent.click(screen.getByTestId("button"));

        await waitFor(() => {
            expect(screen.getByText("File deploy failed")).toBeDefined();
            expect(screen.getByText(/Failed to upload file/i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
