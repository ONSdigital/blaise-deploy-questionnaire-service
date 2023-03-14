/**
 * @jest-environment jsdom
 */

import flushPromises from "../../../tests/utils";
import { render, waitFor, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import React from "react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { opnQuestionnaire } from "../../../features/step_definitions/helpers/apiMockObjects";
import QuestionnaireDetails from "./questionnaireDetails";

const mock = new MockAdapter(axios);

describe("Questionnaire details happy path", () => {
    beforeEach(() => {
        render(
            <QuestionnaireDetails questionnaire={opnQuestionnaire} modes={["CATI"]} />
        );
    });

    afterEach(() => {
        mock.reset();
    });

    it("should display 'Questionnaire details' as a header", async () => {
            await act(async () => {
                await flushPromises();
            });

            await waitFor(() => {
                expect(screen.getByText("Questionnaire details")).toBeDefined();
            });
        });

    it("should display the questionnaire's 'Questionnaire status'", async () => {
            await act(async () => {
                await flushPromises();
            });

            await waitFor(() => {
                expect(screen.getByText("Questionnaire status")).toBeDefined();
                expect(screen.getByText("Active")).toBeDefined();
            });
        });

    it("should display the questionnaire's 'Modes'", async () => {
            await act(async () => {
                await flushPromises();
            });

            await waitFor(() => {
                expect(screen.getByText("Modes")).toBeDefined();
                expect(screen.getByText("CATI")).toBeDefined();
            });
        });

    it("should display the questionnaire's 'Number of cases'", async () => {
            await act(async () => {
                await flushPromises();
            });

            await waitFor(() => {
                expect(screen.getByText("Number of cases")).toBeDefined();
                expect(screen.getByText("0")).toBeDefined();
            });
        });

    it("should display the questionnaire's 'Install date'", async () => {
            await act(async () => {
                await flushPromises();
            });

            await waitFor(() => {
                expect(screen.getByText("Install date")).toBeDefined();
                expect(screen.getByText("15/01/2021 15:26")).toBeDefined();
            });
        });
});
