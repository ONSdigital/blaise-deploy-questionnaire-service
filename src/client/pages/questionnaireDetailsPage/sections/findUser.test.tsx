import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { createWrapper } from "../../../test-utils/renderWithQueryClient";

import { FindUser } from "./findUser";
import "@testing-library/jest-dom/vitest";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("FindUser happy path", () => {
  const roles = ["Role1"];
  const users = ["Jill", "Jimmy", "Timmy", "Erin"];

  afterEach(() => {
    mock.reset();
  });

  it("renders input and label", async () => {
    render(
      <FindUser
        label="Enter username"
        roles={roles}
      />,
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    });
  });

  it("does not disable input while loading", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
    render(
      <FindUser
        label="Enter username"
        roles={roles}
      />,
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter username")).not.toBeDisabled();
    });
  });

  it("filters users as you type", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
    render(
      <FindUser
        label="Enter username"
        roles={roles}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter username")).not.toBeDisabled();
    });

    fireEvent.change(screen.getByPlaceholderText("Enter username"), {
      target: { value: "im" },
    });

    const optionValues = screen.getAllByRole("option").map((option) => option.textContent);

    expect(optionValues).toContain("Jimmy");
    expect(optionValues).toContain("Timmy");
  });

  it("calls onItemSelected when a valid user is selected", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
    const onItemSelected = vi.fn();

    render(
      <FindUser
        label="Enter username"
        roles={roles}
        onItemSelected={onItemSelected}
      />,
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(screen.getByPlaceholderText("Enter username")).not.toBeDisabled());
    const input = screen.getByPlaceholderText("Enter username");

    fireEvent.change(input, { target: { value: "Jill" } });
    expect(onItemSelected).toHaveBeenCalledWith("Jill");
  });

  it("calls onError if API fails", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("API error"));
    const onError = vi.fn();

    render(
      <FindUser
        label="Enter username"
        roles={roles}
        onError={onError}
      />,
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(onError).toHaveBeenCalled());
  });

  it("calls onError when the API returns a non-array payload", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: "bad payload" } });
    const onError = vi.fn();

    render(
      <FindUser
        label="Enter username"
        roles={roles}
        onError={onError}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(onError).toHaveBeenCalledWith("Unable to get users"));
  });

  it("clears input and calls onItemSelected with empty string on blur if input is not a user", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
    const onItemSelected = vi.fn();

    render(
      <FindUser
        label="Enter username"
        roles={roles}
        onItemSelected={onItemSelected}
      />,
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(screen.getByPlaceholderText("Enter username")).not.toBeDisabled());
    const input = screen.getByPlaceholderText("Enter username");

    fireEvent.change(input, { target: { value: "NotAUser" } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(input).toHaveValue("");
      expect(onItemSelected).toHaveBeenCalledWith("");
    });
  });

  it("calls onError on blur when a non-empty invalid username is entered", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
    const onItemSelected = vi.fn();
    const onError = vi.fn();

    render(
      <FindUser
        label="Enter username"
        roles={roles}
        onItemSelected={onItemSelected}
        onError={onError}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(screen.getByPlaceholderText("Enter username")).not.toBeDisabled());
    const input = screen.getByPlaceholderText("Enter username");

    fireEvent.change(input, { target: { value: "NotAUser" } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Username does not exist");
      expect(onItemSelected).toHaveBeenCalledWith("");
    });
  });

  it("does not call onError on blur when the invalid input is only whitespace", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
    const onItemSelected = vi.fn();
    const onError = vi.fn();

    render(
      <FindUser
        label="Enter username"
        roles={roles}
        onItemSelected={onItemSelected}
        onError={onError}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(screen.getByPlaceholderText("Enter username")).not.toBeDisabled());
    const input = screen.getByPlaceholderText("Enter username");

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(onError).not.toHaveBeenCalled();
      expect(onItemSelected).toHaveBeenCalledWith("");
    });
  });

  it("does not clear the input on blur when a valid username is selected", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
    const onItemSelected = vi.fn();
    const onError = vi.fn();

    render(
      <FindUser
        label="Enter username"
        roles={roles}
        onItemSelected={onItemSelected}
        onError={onError}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(screen.getByPlaceholderText("Enter username")).not.toBeDisabled());
    const input = screen.getByPlaceholderText("Enter username");

    fireEvent.change(input, { target: { value: "Jill" } });
    fireEvent.blur(input);

    expect(input).toHaveValue("Jill");
    expect(onItemSelected).toHaveBeenCalledWith("Jill");
    expect(onError).not.toHaveBeenCalled();
  });

  it("shows the design-system no results option if the filter matches no users", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
    render(
      <FindUser
        label="Enter username"
        roles={roles}
      />,
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(screen.getByPlaceholderText("Enter username")).not.toBeDisabled());
    const input = screen.getByPlaceholderText("Enter username");

    fireEvent.change(input, { target: { value: "zzz" } });

    await waitFor(() => {
      expect(screen.getByRole("option")).toHaveTextContent("No results found");
    });
  });

  it("returns users in alphabetical order", async () => {
    const unordered = ["Timmy", "Jill", "Erin", "Jimmy"];

    mockedAxios.post.mockResolvedValueOnce({ data: { message: unordered } });
    render(
      <FindUser
        label="Enter username"
        roles={roles}
      />,
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(screen.getByPlaceholderText("Enter username")).not.toBeDisabled());
    const input = screen.getByPlaceholderText("Enter username");

    fireEvent.change(input, { target: { value: "i" } });

    const optionValues = screen.getAllByRole("option").map((option) => option.textContent);

    expect(optionValues).toEqual(["Erin", "Jill", "Jimmy", "Timmy"]);
  });

  it("allows a suggested user to be selected from the results list", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } });
    const onItemSelected = vi.fn();

    render(
      <FindUser
        label="Enter username"
        roles={roles}
        onItemSelected={onItemSelected}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(screen.getByPlaceholderText("Enter username")).not.toBeDisabled());

    fireEvent.change(screen.getByPlaceholderText("Enter username"), {
      target: { value: "jim" },
    });
    fireEvent.click(screen.getByRole("option", { name: "Jimmy" }));

    expect(screen.getByPlaceholderText("Enter username")).toHaveValue("Jimmy");
    expect(onItemSelected).toHaveBeenCalledWith("Jimmy");
  });
});
