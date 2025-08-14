/**
 * @jest-environment jsdom
 */

import flushPromises from "../../../tests/utils";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import React from "react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import FindUserComponent from "../sections/findUserComponent";
import "@testing-library/jest-dom";

const mock = new MockAdapter(axios);
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("FindUserComponent happy path", () => {
    const roles = ["Role1"];
    const users = ["Jill", "Jimmy", "Timmy", "Erin"];

    afterEach(() => {
        mock.reset();
    });

    it("renders input and label", async () => {
        render(<FindUserComponent label="Test Label" roles={roles} />);
        await waitFor(() => {
            expect(screen.getByText("Test Label")).toBeDefined();
        });
    });

    it("does not disable input while loading", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: users } }); // mock before render
        render(<FindUserComponent label="Test Label" roles={roles} />);
        await waitFor(() => {
            expect(screen.getByLabelText("Test Label")).not.toBeDisabled();
        });
    });

    it("filters users as you type", async () => {

        mockedAxios.post.mockResolvedValueOnce({ data: { message: users } }); // mock before render
        render(<FindUserComponent label="Test Label" roles={roles} />);

        await waitFor(() => {
            expect(screen.getByLabelText("Test Label")).not.toBeDisabled();
        });

        const datalist = screen.getByRole("combobox").getAttribute("list");
        const options = document.getElementById(datalist).querySelectorAll("option");
        const optionValues = Array.from(options).map(opt => opt.getAttribute("value"));
        expect(optionValues).toContain("Jimmy");
        expect(optionValues).toContain("Timmy");
    });

    it("calls onItemSelected when a valid user is selected", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
        const onItemSelected = jest.fn();
        render(<FindUserComponent label="Test Label" roles={roles} onItemSelected={onItemSelected} />);
        await waitFor(() => expect(screen.getByLabelText("Test Label")).not.toBeDisabled());
        const input = screen.getByLabelText("Test Label");
        fireEvent.change(input, { target: { value: "Jill" } });
        expect(onItemSelected).toHaveBeenCalledWith("Jill");
    });

    it("calls onError if API fails", async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error("API error"));
        const onError = jest.fn();
        render(<FindUserComponent label="Test Label" roles={roles} onError={onError} />);
        await waitFor(() => expect(onError).toHaveBeenCalled());
    });

    it("clears input and calls onItemSelected with empty string on blur if input is not a user", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
        const onItemSelected = jest.fn();
        render(<FindUserComponent label="Test Label" roles={roles} onItemSelected={onItemSelected} />);
        await waitFor(() => expect(screen.getByLabelText("Test Label")).not.toBeDisabled());
        const input = screen.getByLabelText("Test Label");
        fireEvent.change(input, { target: { value: "NotAUser" } });
        fireEvent.blur(input);
        expect(input).toHaveValue("");
        expect(onItemSelected).toHaveBeenCalledWith("");
    });

    it("shows no options if filter matches no users", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
        render(<FindUserComponent label="Test Label" roles={roles} />);
        await waitFor(() => expect(screen.getByLabelText("Test Label")).not.toBeDisabled());
        const input = screen.getByLabelText("Test Label");
        fireEvent.change(input, { target: { value: "zzz" } });
        expect(screen.queryAllByRole("option")).toHaveLength(0);
    });

    it("returns users in alphabetical order", async () => {
        const unordered = ["Timmy", "Jill", "Erin", "Jimmy"];
        mockedAxios.post.mockResolvedValueOnce({ data: { message: unordered } });
        render(<FindUserComponent label="Test Label" roles={roles} />);
        await waitFor(() => expect(screen.getByLabelText("Test Label")).not.toBeDisabled());
        const input = screen.getByLabelText("Test Label");
        fireEvent.focus(input);
        const datalistId = screen.getByRole("combobox").getAttribute("list");
        const datalist = document.getElementById(datalistId);
        const options = datalist ? Array.from(datalist.querySelectorAll("option")) : [];
        const optionValues = options.map(opt => opt.getAttribute("value"));
        expect(optionValues).toEqual(["Erin", "Jill", "Jimmy", "Timmy"]);
    });
});