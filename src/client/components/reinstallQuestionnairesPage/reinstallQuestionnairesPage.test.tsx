import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react";
import { BrowserRouter, createMemoryRouter, RouterProvider } from "react-router-dom";

import flushPromises from "../../test-utils/flushPromises";
import { createWrapper } from "../../test-utils/renderWithQueryClient";

import ReinstallQuestionnaires from "./reinstallQuestionnairesPage";

import type { Questionnaire } from "blaise-api-node-client";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

const questionnaireList: Questionnaire[] = [
  {
    name: "OPN2101A",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "January 2021",
  },
];

const bucketQuestionnaire: string[] = ["OPN2101A.bpkg", "OPN2004A.bpkg", "LMS2101_BK2.bpkg"];

describe("Reinstall questionnaires list", () => {
  beforeEach(() => {
    mock.onGet("/api/questionnaires").reply(200, questionnaireList);
    mock.onGet("/bucket/files").reply(200, bucketQuestionnaire);
  });

  afterEach(() => {
    mock.reset();
  });

  it("view Blaise Status page matches Snapshot", async () => {
    const wrapper = render(<ReinstallQuestionnaires />, { wrapper: createWrapper(BrowserRouter) });

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
      expect(wrapper);
    });
  });

  it("should render correctly", async () => {
    render(<ReinstallQuestionnaires />, { wrapper: createWrapper(BrowserRouter) });

    await act(async () => {
      await flushPromises();
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
      expect(screen.getByText(/OPN2004A/i)).toBeDefined();
      expect(screen.getByText(/LMS2101_BK2/i)).toBeDefined();
      expect(screen.queryByText(/OPN2101A/i)).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });
  });

  it("should enable install button once a questionnaire is selected", async () => {
    render(<ReinstallQuestionnaires />, { wrapper: createWrapper(BrowserRouter) });

    await act(async () => {
      await flushPromises();
      await flushPromises();
    });

    fireEvent.change(
      screen.getByRole("combobox", { name: /Select a questionnaire to reinstall/i }),
      {
        target: { value: "OPN2004A.bpkg" },
      },
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
    });
  });

  it("should navigate to questionnaires page when cancel is clicked", async () => {
    const routes = [
      {
        path: "/reinstall",
        element: <ReinstallQuestionnaires />,
      },
      {
        path: "/",
        element: <h1>Questionnaires page</h1>,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ["/reinstall"],
      initialIndex: 0,
    });

    render(<RouterProvider router={router} />, { wrapper: createWrapper() });

    await act(async () => {
      await flushPromises();
      await flushPromises();
    });

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Questionnaires page/i })).toBeInTheDocument();
    });
  });

  it("should render a message if all items in bucket are already installed", async () => {
    const questionnaireList: unknown[] = [
      { name: "OPN2101A" },
      { name: "OPN2004A" },
      { name: "LMS2101_BK2" },
    ];

    mock.onGet("/api/questionnaires").reply(200, questionnaireList);

    render(<ReinstallQuestionnaires />, { wrapper: createWrapper(BrowserRouter) });

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
      expect(
        screen.getByText(/No compatible previously installed questionnaires found./i),
      ).toBeDefined();
    });
  });
});

describe("Reinstall questionnaires", () => {
  beforeEach(() => {
    mock.onGet("/api/questionnaires").reply(200, []);
    mock.onGet("/bucket/files").reply(200, bucketQuestionnaire);
    mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(200, { name: "OPN2004A.bpkg" });
    mock.onPost("/api/install").reply(201);
  });

  afterEach(() => {
    mock.reset();
  });

  it("should show the success outcome after install", async () => {
    const routes = [
      {
        path: "/reinstall",
        element: <ReinstallQuestionnaires />,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ["/reinstall"],
      initialIndex: 0,
    });

    render(<RouterProvider router={router} />, { wrapper: createWrapper() });

    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      fireEvent.change(
        screen.getByRole("combobox", { name: /Select a questionnaire to reinstall/i }),
        {
          target: { value: "OPN2004A.bpkg" },
        },
      );
      await flushPromises();
      fireEvent.click(screen.getByText(/Continue/i));
      await flushPromises();
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Questionnaire .*OPN2004A.* deployed/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /View questionnaires/i })).toBeInTheDocument();
    });
  });

  it("returns to the questionnaire list when viewing questionnaires from the success outcome", async () => {
    const routes = [
      {
        path: "/reinstall",
        element: <ReinstallQuestionnaires />,
      },
      {
        path: "/",
        element: <h1>Questionnaires page</h1>,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ["/reinstall"],
      initialIndex: 0,
    });

    render(<RouterProvider router={router} />, { wrapper: createWrapper() });

    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      fireEvent.change(
        screen.getByRole("combobox", { name: /Select a questionnaire to reinstall/i }),
        {
          target: { value: "OPN2004A.bpkg" },
        },
      );
      await flushPromises();
      fireEvent.click(screen.getByText(/Continue/i));
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /View questionnaires/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /View questionnaires/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Questionnaires page/i })).toBeInTheDocument();
    });
  });

  it("should show failure outcome when install fails", async () => {
    mock.onPost("/api/install").reply(500);

    const routes = [
      {
        path: "/reinstall",
        element: <ReinstallQuestionnaires />,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ["/reinstall"],
      initialIndex: 0,
    });

    render(<RouterProvider router={router} />, { wrapper: createWrapper() });

    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      fireEvent.change(
        screen.getByRole("combobox", { name: /Select a questionnaire to reinstall/i }),
        {
          target: { value: "OPN2004A.bpkg" },
        },
      );
      await flushPromises();
      fireEvent.click(screen.getByText(/Continue/i));
      await flushPromises();
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Questionnaire .*OPN2004A.* deploy failed/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Reason: Failed to install the questionnaire/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Return to reinstall questionnaire/i }),
      ).toBeInTheDocument();
    });
  });

  it("returns to the reinstall form when retry is clicked from the failure outcome", async () => {
    mock.onPost("/api/install").reply(500);

    const routes = [
      {
        path: "/reinstall",
        element: <ReinstallQuestionnaires />,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ["/reinstall"],
      initialIndex: 0,
    });

    render(<RouterProvider router={router} />, { wrapper: createWrapper() });

    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      fireEvent.change(
        screen.getByRole("combobox", { name: /Select a questionnaire to reinstall/i }),
        {
          target: { value: "OPN2004A.bpkg" },
        },
      );
      await flushPromises();
      fireEvent.click(screen.getByText(/Continue/i));
      await flushPromises();
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Return to reinstall questionnaire/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Return to reinstall questionnaire/i }));

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /Select a questionnaire to reinstall/i })).toBeInTheDocument();
    });
  });

  it("should render a message if all items in bucket are already installed", async () => {
    const questionnaireList: unknown[] = [
      { name: "OPN2101A" },
      { name: "OPN2004A" },
      { name: "LMS2101_BK2" },
    ];

    mock.onGet("/api/questionnaires").reply(200, questionnaireList);

    render(<ReinstallQuestionnaires />, { wrapper: createWrapper(BrowserRouter) });

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
      expect(
        screen.getByText(/No compatible previously installed questionnaires found./i),
      ).toBeDefined();
    });
  });
});

describe("Given the API returns a 500 status", () => {
  beforeEach(() => {
    mock.onGet("/api/questionnaires").reply(500);
    mock.onGet("/bucket/files").reply(200, bucketQuestionnaire);
  });

  afterEach(() => {
    mock.reset();
  });

  it("it should still render bucket questionnaires when installed list fails", async () => {
    render(<ReinstallQuestionnaires />, { wrapper: createWrapper(BrowserRouter) });

    await waitFor(() => {
      expect(screen.getByText(/OPN2101A/i)).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });
});

describe("Given the bucket request fails", () => {
  beforeEach(() => {
    mock.onGet("/api/questionnaires").reply(200, questionnaireList);
    mock.onGet("/bucket/files").reply(500);
  });

  afterEach(() => {
    mock.reset();
  });

  it("it should render the bucket auth/permissions guidance message", async () => {
    render(<ReinstallQuestionnaires />, { wrapper: createWrapper(BrowserRouter) });

    await waitFor(() => {
      expect(screen.getByText(/Unable to load questionnaires from bucket/i)).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });
});

describe("Given the API returns an empty list", () => {
  beforeEach(() => {
    mock.onGet("/api/questionnaires").reply(200, []);
    mock.onGet("/bucket/files").reply(200, []);
  });

  afterEach(() => {
    mock.reset();
  });

  it("it should render with a message to inform the user in the list", async () => {
    render(<ReinstallQuestionnaires />, { wrapper: createWrapper(BrowserRouter) });

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
      expect(
        screen.getByText(/No compatible previously installed questionnaires found./i),
      ).toBeDefined();
    });
  });
});
