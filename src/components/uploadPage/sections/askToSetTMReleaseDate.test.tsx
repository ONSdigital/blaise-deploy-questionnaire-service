/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import React from "react";
import AskToSetTMReleaseDate from "./askToSetTMReleaseDate";
import { Formik } from "formik";

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

describe("Ask to set TM release date page", () => {
    it("should match the Snapshot", async () => {
        const wrapper = render(
            <Formik initialValues={{}} onSubmit={() => { }} >
                <AskToSetTMReleaseDate questionnaireName={"LMS2207T"} />
            </Formik>
        );

        expect(wrapper).toMatchSnapshot();
    });

    it("should render with the questionnaire name displayed", async () => {
        const { queryByText } = render(
            <Formik initialValues={{}} onSubmit={() => { }}>
                <AskToSetTMReleaseDate questionnaireName={"LMS2207T"} />
            </Formik>
        );

        expect(queryByText(/LMS2207T/i)).toBeInTheDocument();
    });

    it("should render with SetDateForm displayed", async () => {
        const { queryByText } = render(
            <Formik initialValues={{}} onSubmit={() => { }}>
                <AskToSetTMReleaseDate questionnaireName={"LMS2207T"} />
            </Formik>
        );

        expect(queryByText(/Yes, let me specify a release date/i)).toBeInTheDocument();
    });
});

