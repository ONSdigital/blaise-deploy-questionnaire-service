/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import "@testing-library/jest-dom/extend-expect";

const mock = new MockAdapter(axios);

import { AuthManager } from "blaise-login-react-client";
import React from "react";
import AskToSetTMReleaseDate from "./askToSetTMReleaseDate";
import { Formik } from "formik";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

describe("Ask to set TM release date page", () => {
    it("should match the Snapshot", async () => {
        const wrapper = render(
            <Formik initialValues={{ }} onSubmit={( ) => { }} >
                <AskToSetTMReleaseDate questionnaireName={"LMS2207T"}/>
            </Formik>
        );

        expect(wrapper).toMatchSnapshot();
    });

    it("should render with the questionnaire name displayed", async () => {
        const { queryByText } = render(
            <Formik initialValues={{ }} onSubmit={( ) => { }}>
                <AskToSetTMReleaseDate questionnaireName={"LMS2207T"}/>
            </Formik>
        );

        expect(queryByText(/LMS2207T/i)).toBeInTheDocument();
    });

    it("should render with SetDateForm displayed", async () => {
        const { queryByText } = render(
            <Formik initialValues={{ }} onSubmit={( ) => { }}>
                <AskToSetTMReleaseDate questionnaireName={"LMS2207T"}/>
            </Formik>
        );

        expect(queryByText(/Yes, let me specify a release date/i)).toBeInTheDocument();
    });
});

