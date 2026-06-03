import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";

import { createWrapper } from "../../../test-utils/renderWithQueryClient";

import { FindUser } from "./findUser";

vi.mock("axios");

vi.mock("blaise-design-system-react-components", () => ({
  ComboBox: (props: {
    value: string;
    placeholder: string;
    disabled?: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
    onSelect: (option: { label: string; value: string } | null) => void;
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
    onFocus: () => void;
  }) => (
    <div>
      <input
        aria-label={props.placeholder}
        placeholder={props.placeholder}
        value={props.value}
        disabled={props.disabled}
        onChange={(event) => props.onChange(event, event.target.value)}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
      />
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => props.onSelect(null)}
      >
        Clear selection
      </button>
    </div>
  ),
  LoadingPanel: ({ message }: { message?: string }) => <div>{message ?? "Loading"}</div>,
}));

describe("FindUser combobox selection coverage", () => {
  const roles = ["Role1"];
  const users = ["Jill", "Jimmy"];
  const mockedAxios = vi.mocked(axios);

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("clears a pending blur timeout before handling a null selection", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } } as never);
    const onItemSelected = vi.fn();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

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

    vi.useFakeTimers();
    fireEvent.blur(input);
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(onItemSelected).toHaveBeenCalledWith("");
    expect(onItemSelected).toHaveBeenCalledTimes(1);
  });

  it("clears whitespace input on blur without reporting an error", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } } as never);
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

    vi.useFakeTimers();
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.blur(input);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(onError).not.toHaveBeenCalled();
    expect(onItemSelected).toHaveBeenCalledWith("");
    expect(input).toHaveValue("");
  });

  it("clears a pending blur timeout when the input regains focus", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: users } } as never);
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

    render(
      <FindUser
        label="Enter username"
        roles={roles}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(screen.getByPlaceholderText("Enter username")).not.toBeDisabled());

    const input = screen.getByPlaceholderText("Enter username");

    vi.useFakeTimers();
    fireEvent.blur(input);
    fireEvent.focus(input);

    expect(clearTimeoutSpy).toHaveBeenCalled();

    act(() => {
      vi.runOnlyPendingTimers();
    });
  });
});
