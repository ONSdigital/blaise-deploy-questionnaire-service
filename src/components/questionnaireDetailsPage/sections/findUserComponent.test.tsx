/**
 * @jest-environment jsdom
 */

import flushPromises from "../../../tests/utils";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import React from "react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import FindUserComponent from "./findUserComponent";

const mock = new MockAdapter(axios);

describe("FindUserComponent happy path", () => {
    const roles = ["IPS Field Interviewer"];
    const users = ["Jill", "Jimmy", "Timmy", "Erin"];

    beforeEach(() => {
        render(
            <FindUserComponent label="Test Label" roles={roles} onItemSelected={undefined} onError={undefined} />
        );
    });

    afterEach(() => {
        mock.reset();
    });

    it("renders input and label", async () => {
        await act(async () => {
                    await flushPromises();
                }); 
        await waitFor(() => {
            expect(screen.getByText("Test Label")).toBeDefined();
        });
    });
});