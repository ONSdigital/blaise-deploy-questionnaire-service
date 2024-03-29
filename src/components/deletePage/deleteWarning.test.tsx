/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeleteWarning from "./deleteWarning";
import { Questionnaire } from "blaise-api-node-client";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import userEvent from "@testing-library/user-event";

const mockHttp = new MockAdapter(axios);

describe("DeleteWarning", () => {
    const CATI_WARNING_MESSAGE = "Questionnaire has active Telephone Operations survey days";
    const CAWI_WARNING_MESSAGE = "Questionnaire is active for web collection";

    const defaultQuestionnaire: Questionnaire = {
        fieldPeriod: "",
        installDate: "",
        name: "",
        serverParkName: "",
    };

    beforeEach(() => {
        mockHttp.reset();
    });

    describe("when CAWI mode is include", () => {
        it("should display CAWI warning for an active CAWI questionnaire", async () => {
            const questionnaire: Questionnaire = {
                ...defaultQuestionnaire,
                status: "ACTIVE"
            };

            const view = render(
                <DeleteWarning modes={["CAWI"]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />
            );

            expect(await screen.findByText(CAWI_WARNING_MESSAGE)).toBeVisible();
            expect(screen.queryByText("Loading")).toBeNull();
            expect(view).toMatchSnapshot();
        });

        it("should not display CAWI warning for an inactive CAWI questionnaire", async () => {
            const questionnaire: Questionnaire = {
                ...defaultQuestionnaire,
                status: "inactive"
            };

            render(
                <DeleteWarning modes={["CAWI"]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />
            );
            await screen.findByText(/Are you sure you want to delete/);

            expect(screen.queryByText(CAWI_WARNING_MESSAGE)).toBeNull();
            expect(screen.queryByText("Loading")).toBeNull();
        });

        it("should not display CAWI warning for an active non-CAWI questionnaire", async () => {
            const questionnaire: Questionnaire = {
                ...defaultQuestionnaire,
                status: "active"
            };

            render(
                <DeleteWarning modes={["OTHER"]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />
            );

            expect(screen.queryByText(CAWI_WARNING_MESSAGE)).toBeNull();
            expect(screen.queryByText("Loading")).toBeNull();
        });
    });

    describe("when CATI mode is present", () => {
        it("should display the loading page while waiting for the CATI status", async () => {
            const questionnaire: Questionnaire = {
                ...defaultQuestionnaire,
                name: "LMS2201_AA1",
                status: "active",
            };
            mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, true);

            const view = render(
                <DeleteWarning modes={["CATI"]} questionnaire={questionnaire} onDelete={() => { }} onCancel={() => {}}/>
            );
            expect(screen.getByText("Loading")).toBeVisible();
            expect(view).toMatchSnapshot();

            await screen.findByText(CATI_WARNING_MESSAGE); // Removes missing act warning
        });

        it("should display the CATI warning for an active CATI questionnaire", async () => {
            const questionnaire: Questionnaire = {
                ...defaultQuestionnaire,
                name: "LMS2201_AA1",
                status: "active",
            };
            mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, true);

            const view = render(<DeleteWarning modes={["CATI"]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />);
            expect(await screen.findByText(CATI_WARNING_MESSAGE)).toBeVisible();
            expect(view).toMatchSnapshot();
        });

        it("should not fetch the active status more than once", async () => {
            const questionnaire: Questionnaire = {
                ...defaultQuestionnaire,
                name: "LMS2201_AA1",
                status: "active",
            };
            mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, true);

            const { rerender } = render(<DeleteWarning modes={["CATI"]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />);
            expect(await screen.findByText(CATI_WARNING_MESSAGE)).toBeVisible();
            rerender(<DeleteWarning modes={["CATI"]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />);

            expect(mockHttp.history.get.length).toBe(1);
        });

        it("should not display the CATI warning for an inactive CATI questionnaire", async () => {
            const questionnaire: Questionnaire = {
                ...defaultQuestionnaire,
                name: "LMS2201_AA1",
                status: "not-active",
            };
            mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, true);

            render(<DeleteWarning modes={["CATI"]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />);
            await screen.findByText(/Are you sure you want to delete/);

            expect(screen.queryByText(CATI_WARNING_MESSAGE)).toBeNull();
        });

        it("should not display the CATI warning for an inactive request CATI questionnaire", async () => {
            const questionnaire: Questionnaire = {
                ...defaultQuestionnaire,
                name: "LMS2201_AA1",
                status: "active",
            };
            mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, false);

            render(<DeleteWarning modes={["CATI"]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />);
            await screen.findByText(/Are you sure you want to delete/);

            expect(screen.queryByText(CATI_WARNING_MESSAGE)).toBeNull();
        });

        it("should not display the CATI warning for an active non-CATI questionnaire", async () => {
            const questionnaire: Questionnaire = {
                ...defaultQuestionnaire,
                name: "LMS2201_AA1",
                status: "active",
            };
            mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(200, true);

            render(<DeleteWarning modes={["OTHER"]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />);
            await screen.findByText(/Are you sure you want to delete/);

            expect(screen.queryByText(CATI_WARNING_MESSAGE)).toBeNull();
        });

        it("should display an error when the CATI active check fails", async () => {
            const questionnaire: Questionnaire = {
                ...defaultQuestionnaire,
                name: "LMS2201_AA1",
                status: "active",
            };
            mockHttp.onGet("/api/questionnaires/LMS2201_AA1/active").reply(500);

            const view = render(<DeleteWarning modes={["CATI"]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />);

            const errorMessage = "Could not get warning details, please try again";
            expect(await screen.findByText(errorMessage)).toBeVisible();
            expect(view).toMatchSnapshot();
        });
    });

    describe("when the Cancel button is pressed", () => {
        it("should call onCancel on cancel", async () => {
            const onCancel = jest.fn();
            const onDelete = jest.fn();
            render(
                <DeleteWarning modes={[]} questionnaire={defaultQuestionnaire} onDelete={onDelete} onCancel={onCancel} />
            );

            const cancel = await screen.findByRole("button", { name: "Cancel" });
            userEvent.click(cancel);

            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(onDelete).not.toHaveBeenCalled();
        });
    });

    describe("when Delete button is pressed", () => {
        const questionnaire = { ...defaultQuestionnaire, name: "LMS2210_CC1" };

        beforeEach(() => {
            mockHttp.onDelete("/api/tostartdate/LMS2210_CC1").reply(204);
            mockHttp.onDelete("/api/tmreleasedate/LMS2210_CC1").reply(204);
            mockHttp.onDelete("/api/questionnaires/LMS2210_CC1").reply(204);
        });

        it("should delete the TO start date, release date and questionnaire on confirm", async () => {
            render(
                <DeleteWarning modes={[]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />
            );

            const confirm = await screen.findByRole("button", { name: "Delete" });
            userEvent.click(confirm);

            await waitFor(() => { expect(mockHttp.history.delete.length).toBe(3); });
            expect(mockHttp.history.delete[0].url).toBe("/api/tostartdate/LMS2210_CC1");
            expect(mockHttp.history.delete[1].url).toBe("/api/tmreleasedate/LMS2210_CC1");
            expect(mockHttp.history.delete[2].url).toBe("/api/questionnaires/LMS2210_CC1");
        });

        it("should set the status", async () => {
            const onDelete = jest.fn();
            const onCancel = jest.fn();
            render(
                <DeleteWarning modes={[]} questionnaire={questionnaire} onDelete={onDelete} onCancel={onCancel} />
            );

            const confirm = await screen.findByRole("button", { name: "Delete" });
            userEvent.click(confirm);
            await waitFor(() => {
                expect(onDelete).toHaveBeenCalledWith("Questionnaire: LMS2210_CC1 Successfully deleted");
            });

            expect(onCancel).not.toHaveBeenCalled();
        });

        it("should display an error if deleting TO start date fails", async () => {
            mockHttp.onDelete("/api/tostartdate/LMS2210_CC1").reply(500);
            const view = render(
                <DeleteWarning modes={[]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />
            );

            const confirm = await screen.findByRole("button", { name: "Delete" });
            userEvent.click(confirm);

            expect(await screen.findByText(/Failed to delete TO start date/)).toBeVisible();
            expect(mockHttp.history.delete.length).toBe(1);
            expect(view).toMatchSnapshot();
        });

        it("should display an error if deleting TO release date fails", async () => {
            mockHttp.onDelete("/api/tmreleasedate/LMS2210_CC1").reply(500);
            render(
                <DeleteWarning modes={[]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />
            );

            const confirm = await screen.findByRole("button", { name: "Delete" });
            userEvent.click(confirm);

            expect(await screen.findByText(/Failed to delete Totalmobile release date/)).toBeVisible();
            expect(mockHttp.history.delete.length).toBe(2);
        });

        it("should display an error if deleting questionnaire fails", async () => {
            mockHttp.onDelete("/api/questionnaires/LMS2210_CC1").reply(500);
            render(
                <DeleteWarning modes={[]} questionnaire={questionnaire} onDelete={() => {}} onCancel={() => {}} />
            );

            const confirm = await screen.findByRole("button", { name: "Delete" });
            userEvent.click(confirm);

            expect(await screen.findByText(/Failed to delete the questionnaire/)).toBeVisible();
            expect(mockHttp.history.delete.length).toBe(3);
        });
    });
});
