/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import InstrumentSettingsTable from "./InstrumentSettingsTable";
import { InstrumentSettings } from "blaise-api-node-client";

const viewInstrumentSettingsFailedMessage = /Failed to get questionnaire settings/i;

describe("Instrument settings table", () => {
  const instrumentSettingsValid: InstrumentSettings = {
    type: "StrictInterviewing",
    saveSessionOnTimeout: true,
    saveSessionOnQuit: true,
    deleteSessionOnTimeout: true,
    deleteSessionOnQuit: true,
    sessionTimeout: 15,
    applyRecordLocking: true
  };


  const instrumentSettingsInvalid: InstrumentSettings = {
    type: "StrictInterviewing",
    saveSessionOnTimeout: false,
    saveSessionOnQuit: true,
    deleteSessionOnTimeout: false,
    deleteSessionOnQuit: false,
    sessionTimeout: 15,
    applyRecordLocking: false
  };

  const invalidSettings: Partial<InstrumentSettings> = {
    saveSessionOnTimeout: true,
    deleteSessionOnQuit: true,
    deleteSessionOnTimeout: true,
    applyRecordLocking: true
  };

  describe("when the page errors", () => {
    it("renders the error component", async () => {
      render(
        <InstrumentSettingsTable errored={true} instrumentSettings={undefined} invalidSettings={{}} />
      );

      await waitFor(() => {
        expect(screen.getByText(viewInstrumentSettingsFailedMessage)).toBeDefined();
      });
    });
  });

  describe("all the settings are valid", () => {
    it("renders the expected settings", async () => {
      render(
        <InstrumentSettingsTable errored={false} instrumentSettings={instrumentSettingsValid} invalidSettings={{}} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Questionnaire settings/i)).toBeDefined();
        expect(screen.getByText(/Type/i)).toBeDefined();
        expect(screen.getByText(/SaveSessionOnQuit/i)).toBeDefined();
        expect(screen.getByText(/SessionTimeout/i)).toBeDefined();
      });
    });
  });

  describe("some of the settings are invalid", () => {
    it("renders the expected settings and highlights invalid fields", async () => {
      render(
        <InstrumentSettingsTable errored={false} instrumentSettings={instrumentSettingsInvalid} invalidSettings={invalidSettings} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Questionnaire settings/i)).toBeDefined();
        expect(screen.getByText(/Type/i)).toBeDefined();
        expect(screen.getByText(/SaveSessionOnQuit/i)).toBeDefined();
        expect(screen.getByText(/SessionTimeout/i)).toBeDefined();
        expect(screen.getByText(/SaveSessionOnTimeout should be True/i)).toBeDefined();
        expect(screen.getByText(/DeleteSessionOnTimeout should be True/i)).toBeDefined();
        expect(screen.getByText(/DeleteSessionOnQuit should be True/i)).toBeDefined();
        expect(screen.getByText(/ApplyRecordLocking should be True/i)).toBeDefined();
      });
    });
  });
});
