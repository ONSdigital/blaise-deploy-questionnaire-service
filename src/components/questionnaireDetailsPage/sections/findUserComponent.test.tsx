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
        render(<FindUserComponent label="Enter Username" roles={roles} />);
        await waitFor(() => {
            expect(screen.getByPlaceholderText("Enter Username")).toBeInTheDocument();
        });
    });

    it("does not disable input while loading", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: users } }); // mock before render
        render(<FindUserComponent label="Enter Username" roles={roles} />);
        await waitFor(() => {
            expect(screen.getByPlaceholderText("Enter Username")).not.toBeDisabled();
        });
    });

    it("filters users as you type", async () => {

        mockedAxios.post.mockResolvedValueOnce({ data: { message: users } }); // mock before render
        render(<FindUserComponent label="Enter Username" roles={roles} />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText("Enter Username")).not.toBeDisabled();
        });

        if (document != null) {
            const datalistId = screen.getByRole("combobox").getAttribute("list")!;
            const datalist = document.getElementById(datalistId)!;
            const options = Array.from(datalist.querySelectorAll("option"));
            const optionValues = options.map(opt => opt.getAttribute("value"));
            expect(optionValues).toContain("Jimmy");
            expect(optionValues).toContain("Timmy");
        } else {
            throw new Error("Datalist not found");
        }
    });

    it("calls onItemSelected when a valid user is selected", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
        const onItemSelected = jest.fn();
        render(<FindUserComponent label="Enter Username" roles={roles} onItemSelected={onItemSelected} />);
        await waitFor(() => expect(screen.getByPlaceholderText("Enter Username")).not.toBeDisabled());
        const input = screen.getByPlaceholderText("Enter Username");
        fireEvent.change(input, { target: { value: "Jill" } });
        expect(onItemSelected).toHaveBeenCalledWith("Jill");
    });

    it("calls onError if API fails", async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error("API error"));
        const onError = jest.fn();
        render(<FindUserComponent label="Enter Username" roles={roles} onError={onError} />);
        await waitFor(() => expect(onError).toHaveBeenCalled());
    });

    it("clears input and calls onItemSelected with empty string on blur if input is not a user", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
        const onItemSelected = jest.fn();
        render(<FindUserComponent label="Enter Username" roles={roles} onItemSelected={onItemSelected} />);
        await waitFor(() => expect(screen.getByPlaceholderText("Enter Username")).not.toBeDisabled());
        const input = screen.getByPlaceholderText("Enter Username");
        fireEvent.change(input, { target: { value: "NotAUser" } });
        fireEvent.blur(input);
        expect(input).toHaveValue("");
        expect(onItemSelected).toHaveBeenCalledWith("");
    });

    it("shows no options if filter matches no users", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
        render(<FindUserComponent label="Enter Username" roles={roles} />);
        await waitFor(() => expect(screen.getByPlaceholderText("Enter Username")).not.toBeDisabled());
        const input = screen.getByPlaceholderText("Enter Username");
        fireEvent.change(input, { target: { value: "zzz" } });
        expect(screen.queryAllByRole("option")).toHaveLength(0);
    });

    it("returns users in alphabetical order", async () => {
        const unordered = ["Timmy", "Jill", "Erin", "Jimmy"];
        mockedAxios.post.mockResolvedValueOnce({ data: { message: unordered } });
        render(<FindUserComponent label="Enter Username" roles={roles} />);
        await waitFor(() => expect(screen.getByPlaceholderText("Enter Username")).not.toBeDisabled());
        const input = screen.getByPlaceholderText("Enter Username");
        fireEvent.focus(input);
        const datalistId = screen.getByRole("combobox").getAttribute("list");
        if (datalistId) {
            const datalist = document.getElementById(datalistId);
            expect(datalist).not.toBeNull(); 
            if (datalist) {
                const options = datalist ? Array.from(datalist.querySelectorAll("option")) : [];
                const optionValues = options.map(opt => opt.getAttribute("value"));
                expect(optionValues).toEqual(["Erin", "Jill", "Jimmy", "Timmy"]);
            }
        }
       
    });
});