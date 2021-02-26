import React, {ReactElement} from "react";
import styled from "styled-components";

interface Props {
    instrumentName: string
    isVerifyIsInstalled: string
    isInstalling: string
    isUploading: string
    isVerifyingUpload: string
    isInitialisingUpload: string
    uploadPercentage: number
}

export const step_status = {
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    COMPLETE: "Completed",
    FAILED: "Failed",
};


const SpaciousTableRow = styled.tr`
  td:first-of-type {
    padding: 1.3rem 0 1.3rem;
  }

  td {
    width: 1rem;
    padding: 1.3rem 0 1.3rem 1rem;
  }
`;

const StyledSVG = styled.svg`
  margin-right: 5px
`;

function DeploymentSummary({
                               instrumentName,
                               isVerifyIsInstalled,
                               isInstalling,
                               isUploading,
                               uploadPercentage,
                               isVerifyingUpload,
                               isInitialisingUpload
                           }: Props): ReactElement {

    function getIsVerifyIsInstalled() {
        switch (isVerifyIsInstalled) {
            case step_status.NOT_STARTED:
                return <span className="status status--pending">Not started</span>;
            case step_status.IN_PROGRESS:
                return <><LoadingIcon/>Verifying</>;
            case step_status.COMPLETE:
                return <span className="status status--success">Completed</span>;
            case step_status.FAILED:
                return <span className="status status--error">Failed</span>;
        }
        return <p>hello</p>;
    }

    function getIsInitialisingUpload() {
        switch (isInitialisingUpload) {
            case step_status.NOT_STARTED:
                return <span className="status status--pending">Not started</span>;
            case step_status.IN_PROGRESS:
                return <><LoadingIcon/>Initialing</>;
            case step_status.COMPLETE:
                return <span className="status status--success">Completed</span>;
            case step_status.FAILED:
                return <span className="status status--error">Failed</span>;
        }
        return <p>hello</p>;
    }

    function getIsUploading() {
        switch (isUploading) {
            case step_status.NOT_STARTED:
                return <span className="status status--pending">Not started</span>;
            case step_status.IN_PROGRESS:
                return <><LoadingIcon/>Uploading {uploadPercentage}%</>;
            case step_status.COMPLETE:
                return <span className="status status--success">Completed</span>;
            case step_status.FAILED:
                return <span className="status status--error">Failed</span>;
        }
        return <p>hello</p>;
    }

    function getIsVerifyingUpload() {
        switch (isVerifyingUpload) {
            case step_status.NOT_STARTED:
                return <span className="status status--pending">Not started</span>;
            case step_status.IN_PROGRESS:
                return <><LoadingIcon/>Verifying</>;
            case step_status.COMPLETE:
                return <span className="status status--success">Completed</span>;
            case step_status.FAILED:
                return <span className="status status--error">Failed</span>;
        }
        return <p>hello</p>;
    }

    function getIsInstalling() {
        switch (isInstalling) {
            case step_status.NOT_STARTED:
                return <span className="status status--pending">Not started</span>;
            case step_status.IN_PROGRESS:
                return <><LoadingIcon/>Installing</>;
            case step_status.COMPLETE:
                return <span className="status status--success">Completed</span>;
            case step_status.FAILED:
                return <span className="status status--error">Failed</span>;
        }
        return <p>hello</p>;
    }

    return (
        <>


            <table id="deployment-progress-table" className="table summary__items  u-mt-m">
                <thead className="table__head">
                <tr className="table__row">
                    <th scope="col" className="table__header ">
                        <span>Deployment step</span>
                    </th>
                    <th scope="col" className="table__header ">
                        <span>Status</span>
                    </th>
                </tr>
                </thead>
                <tbody className="table__body">
                <SpaciousTableRow className="table__row">
                    <td className="table__cell">
                        Verify if questionnaire is already installed
                    </td>
                    <td className="table__cell">
                        {getIsVerifyIsInstalled()}
                    </td>
                </SpaciousTableRow>
                <SpaciousTableRow className="table__row">
                    <td className="table__cell">
                        Initialise upload
                    </td>
                    <td className="table__cell">
                        {getIsInitialisingUpload()}
                    </td>
                </SpaciousTableRow>
                <SpaciousTableRow className="table__row">
                    <td className="table__cell">
                        Upload questionnaire file
                    </td>
                    <td className="table__cell">
                        {getIsUploading()}
                    </td>
                </SpaciousTableRow>
                <SpaciousTableRow className="table__row">
                    <td className="table__cell">
                        Verify that questionnaire file has been uploaded
                    </td>
                    <td className="table__cell">
                        {getIsVerifyingUpload()}
                    </td>
                </SpaciousTableRow>
                <SpaciousTableRow className="table__row">
                    <td className="table__cell">
                        Install questionnaire
                    </td>
                    <td className="table__cell">
                        {getIsInstalling()}
                    </td>
                </SpaciousTableRow>
                </tbody>
            </table>

        </>
    );
}

export default DeploymentSummary;

function LoadingIcon() {
    return (
        <StyledSVG className="svg-icon uil-default" style={{}} xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 100 100"
                   preserveAspectRatio="xMidYMid">
            <rect x="0" y="0" width="100" height="100" fill="none" className="bk"/>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(0 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(30 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.08333333333333333s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(60 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.16666666666666666s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(90 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.25s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(120 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.3333333333333333s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(150 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.4166666666666667s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(180 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.5s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(210 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.5833333333333334s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(240 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.6666666666666666s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(270 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.75s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(300 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.8333333333333334s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5'
                  transform='rotate(330 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.9166666666666666s'
                         repeatCount='indefinite'/>
            </rect>
        </StyledSVG>
    );
}
