import navigateToDeployPageAndSelectFile, {
    mock_fetch_requests
} from "../../../features/step_definitions/functions";
import {act, cleanup, fireEvent, screen, waitFor} from "@testing-library/react";
import {survey_list} from "../../../features/step_definitions/API_Mock_Objects";
import flushPromises from "../../../tests/utils";

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

describe("Ask to set live date page", () => {

    beforeEach(() => {
        mock_fetch_requests(mock_server_responses);
    });

    it("should come up with a error panel if you don't pick an option", async () => {
        await navigateToDeployPageAndSelectFile();

        await fireEvent.click(screen.getByText(/Continue/));

        await act(async () => {
            await flushPromises();
        });

        await fireEvent.click(screen.getByText(/Continue/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.queryAllByText("Select an option")).toHaveLength(2);
        });
    });

    it("should come up with a error panel if pick set to set a live date but don't enter one", async () => {
        await navigateToDeployPageAndSelectFile();

        await fireEvent.click(screen.getByText(/Continue/));

        await act(async () => {
            await flushPromises();
        });

        await fireEvent.click(screen.getByText(/Yes, let me specify a live date/i));
        await fireEvent.click(screen.getByText(/Continue/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.queryAllByText("Enter a live date")).toHaveLength(2);
        });
    });

    it("should show selected date on the summary page", async () => {
        await navigateToDeployPageAndSelectFile();

        await fireEvent.click(screen.getByText(/Continue/));

        await act(async () => {
            await flushPromises();
        });

        await fireEvent.click(screen.getByText(/Yes, let me specify a live date/i));

        fireEvent.change(screen.getByLabelText(/Please specify date/i), {target: {value: "2030-06-05"}});

        await fireEvent.click(screen.getByText(/Continue/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Deployment summary/i)).toBeDefined();
            expect(screen.getByText(/Live date set to 05\/06\/2030/i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
