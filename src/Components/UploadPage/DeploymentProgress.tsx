import React, {ReactElement, useEffect, useState} from "react";

interface Location {
    state: any
}

interface Props {
    instrumentName: string
    isInstalling: boolean | null
    isUploading: boolean | null
    isVerifyingUpload: boolean | null
    percentage: number
}


function DeploymentSummary({
                               instrumentName,
                               isInstalling,
                               isUploading,
                               percentage,
                               isVerifyingUpload
                           }: Props): ReactElement {

    return (
        <>
            <h1>
                Deployment of <em>{instrumentName}</em> in progress
            </h1>

            <div className="summary summary--hub">
                <div className="summary__group">
                    <table className="summary__items">
                        <thead className="u-vh">
                        <tr>
                            <th>Name of section or person</th>
                            <th>Section progress</th>
                            <th>Access section</th>
                        </tr>
                        </thead>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                 <span className="summary__item-title-icon  summary__item-title-icon--check">
                                   <svg className="svg-icon" viewBox="0 0 13 10" xmlns="http://www.w3.org/2000/svg">
                                     <path
                                         d="M14.35,3.9l-.71-.71a.5.5,0,0,0-.71,0h0L5.79,10.34,3.07,7.61a.51.51,0,0,0-.71,0l-.71.71a.51.51,0,0,0,0,.71l3.78,3.78a.5.5,0,0,0,.71,0h0L14.35,4.6A.5.5,0,0,0,14.35,3.9Z"
                                         transform="translate(-1.51 -3.04)"/>
                                   </svg>
                                 </span>
                                <div className="summary__item--text summary__item-title--text">Verify if questionnaire
                                    is already installed
                                </div>
                                <span className="u-d-no@s u-fs-r"> — Completed</span>
                            </td>
                            <td className="summary__values">
                                Completed
                            </td>

                        </tr>
                        </tbody>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                {isUploading === null ? "" : isUploading ? <LoadingIcon/> :
                                    <span className="summary__item-title-icon  summary__item-title-icon--check">
                                    <svg className="svg-icon" viewBox="0 0 13 10" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M14.35,3.9l-.71-.71a.5.5,0,0,0-.71,0h0L5.79,10.34,3.07,7.61a.51.51,0,0,0-.71,0l-.71.71a.51.51,0,0,0,0,.71l3.78,3.78a.5.5,0,0,0,.71,0h0L14.35,4.6A.5.5,0,0,0,14.35,3.9Z"
                                            transform="translate(-1.51 -3.04)"/>
                                    </svg>
                                </span>
                                }
                                <div className="summary__item--text summary__item-title--text">Uploading questionnaire
                                    file
                                </div>
                                <span className="u-d-no@s u-fs-r"> — Completed</span>
                            </td>
                            <td className="summary__values">
                                {(isUploading === null ? "Not started" : isUploading ? `Uploading ${percentage}%` : "Completed")}
                            </td>

                        </tr>
                        </tbody>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                {isVerifyingUpload === null ? "" : isVerifyingUpload ? <LoadingIcon/> :
                                    <span className="summary__item-title-icon  summary__item-title-icon--check">
                                    <svg className="svg-icon" viewBox="0 0 13 10" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M14.35,3.9l-.71-.71a.5.5,0,0,0-.71,0h0L5.79,10.34,3.07,7.61a.51.51,0,0,0-.71,0l-.71.71a.51.51,0,0,0,0,.71l3.78,3.78a.5.5,0,0,0,.71,0h0L14.35,4.6A.5.5,0,0,0,14.35,3.9Z"
                                            transform="translate(-1.51 -3.04)"/>
                                    </svg>
                                </span>
                                }
                                <div className="summary__item--text summary__item-title--text">Verify that questionnaire
                                    file has been uploaded
                                </div>
                                <span className="u-d-no@s u-fs-r"> — Completed</span>
                            </td>
                            <td className="summary__values">
                                {(isVerifyingUpload === null ? "Not started" : isVerifyingUpload ? "Verifying" : "Completed")}
                            </td>
                        </tr>
                        </tbody>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                {isInstalling === null ? "" : isInstalling ? <LoadingIcon/> :
                                    <span className="summary__item-title-icon  summary__item-title-icon--check">
                                    <svg className="svg-icon" viewBox="0 0 13 10" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M14.35,3.9l-.71-.71a.5.5,0,0,0-.71,0h0L5.79,10.34,3.07,7.61a.51.51,0,0,0-.71,0l-.71.71a.51.51,0,0,0,0,.71l3.78,3.78a.5.5,0,0,0,.71,0h0L14.35,4.6A.5.5,0,0,0,14.35,3.9Z"
                                            transform="translate(-1.51 -3.04)"/>
                                    </svg>
                                    </span>
                                }
                                <div className="summary__item--text summary__item-title--text">Install questionnaire
                                </div>
                                <span className="u-d-no@s u-fs-r"> — Partially completed</span>
                            </td>
                            <td className="summary__values">
                                {(isInstalling === null ? "Not started" : isInstalling ? "Installing" : "Complete")}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    );
}

export default DeploymentSummary;

function LoadingIcon() {
    return (
        <svg className="summary__item-title-icon svg-icon uil-default" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 100 100"
             preserveAspectRatio="xMidYMid">
            <rect x="0" y="0" width="100" height="100" fill="none" className="bk"></rect>
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
        </svg>
    );
}
