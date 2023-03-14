/**
 * @jest-environment jsdom
 */

import flushPromises from "../../tests/utils";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import React from "react";
import { Questionnaire } from "blaise-api-node-client";
import BlaiseNodeInfo from "./blaiseNodeInfo";

const questionnaireWithNodeInfo: Questionnaire = {
    active: false,
    activeToday: false,
    dataRecordCount: 0,
    fieldPeriod: "April 2020",
    hasData: false,
    installDate: "2021-07-26T14:16:11.2565522+01:00",
    name: "OPN2004A",
    nodes: [
        {
            nodeName: "blaise-gusty-mgmt",
            nodeStatus: "Active"
        },
        {
            nodeName: "blaise-gusty-data-entry-1",
            nodeStatus: "Installing"
        },
        {
            nodeName: "blaise-gusty-data-entry-2",
            nodeStatus: "Failed"
        }
    ],
    serverParkName: "gusty",
    status: "Failed"
};

describe("Blaise Node Info Collapsible", () => {
    it("should display every node and its status", async () => {
        render(
            <BlaiseNodeInfo questionnaire={questionnaireWithNodeInfo} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            questionnaireWithNodeInfo.nodes?.forEach((node) => {
                expect(screen.getByText(new RegExp(node.nodeName))).toBeDefined();
                expect(screen.getByText(new RegExp(node.nodeStatus))).toBeDefined();
            });
        });
    });
});
