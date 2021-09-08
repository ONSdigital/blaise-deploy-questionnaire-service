import flushPromises from "../../../tests/utils";
import {render, screen, waitFor} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import React from "react";
import {Instrument} from "../../../../Interfaces";
import BlaiseNodeInfo from "./BlaiseNodeInfo";

const instrumentWithNodeInfo: Instrument = {
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
            <BlaiseNodeInfo instrument={instrumentWithNodeInfo}/>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            instrumentWithNodeInfo.nodes?.forEach((node) => {
                expect(screen.getByText(new RegExp(node.nodeName))).toBeDefined();
                expect(screen.getByText(new RegExp(node.nodeStatus))).toBeDefined();
            });
        });
    });
});
