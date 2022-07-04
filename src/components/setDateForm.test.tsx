/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import "@testing-library/jest-dom/extend-expect";
import { AuthManager } from "blaise-login-react-client";
import React from "react";
import { Formik } from "formik";
import SetDateForm from "./SetDateForm";

const mock = new MockAdapter(axios);

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

describe("SetDateForm for TO Start Date", () => {
    it("should match the Snapshot", async () => {
        const wrapper = render(
            <Formik initialValues={{ }} onSubmit={() => { }} >
                <SetDateForm dateType={"start"}/>
            </Formik>
        );

        expect(wrapper).toMatchSnapshot();
    });

    it("display 'No start date'", async () => {
        const { queryByText } = render(
            <Formik initialValues={{ }} onSubmit={() => { }} >
                <SetDateForm dateType={"start"}/>
            </Formik>
        );

        expect(queryByText(/No start date/i)).toBeInTheDocument();
    });

    it("display 'Yes let me specify a start date'", async () => {
        const { queryByText } = render(
            <Formik initialValues={{ }} onSubmit={() => { }} >
                <SetDateForm dateType={"start"}/>
            </Formik>
        );

        expect(queryByText(/Yes, let me specify a start date/i)).toBeInTheDocument();
    });
});

describe("SetDateForm for TM Release Date", () => {
    it("should match the Snapshot", async () => {
        const wrapper = render(
            <Formik initialValues={{ }} onSubmit={() => { }} >
                <SetDateForm dateType={"release"}/>
            </Formik>
        );

        expect(wrapper).toMatchSnapshot();
    });

    it("display 'No release date'", async () => {
        const { queryByText } = render(
            <Formik initialValues={{ }} onSubmit={() => { }} >
                <SetDateForm dateType={"release"}/>
            </Formik>
        );

        expect(queryByText(/No release date/i)).toBeInTheDocument();
    });

    it("display 'Yes let me specify a release date'", async () => {
        const { queryByText } = render(
            <Formik initialValues={{ }} onSubmit={() => { }} >
                <SetDateForm dateType={"release"}/>
            </Formik>
        );

        expect(queryByText(/Yes, let me specify a release date/i)).toBeInTheDocument();
    });
});

