import { Questionnaire } from "blaise-api-node-client";
import { Collapsible } from "blaise-design-system-react-components";
import QuestionnaireStatus from "../questionnaireStatus";
import React, { Fragment, ReactElement } from "react";

interface NodeProps {
    questionnaire: Questionnaire;
}

function BlaiseNodeInfo({ questionnaire }: NodeProps): ReactElement {
    return (
        <>
            <Collapsible title="What are the questionnaire install states on the Blaise nodes?">
                <>
                    <h3 className="ons-u-mt-m">Blaise Nodes</h3>
                    <dl className="ons-metadata ons-metadata__list ons-grid ons-grid--gutterless ons-u-cf ons-u-mb-l"
                        title="Questionnaire install state on the Blaise nodes"
                        aria-label="Questionnaire install state on the Blaise nodes">
                        {
                            questionnaire.nodes && questionnaire.nodes.map((node) => {
                                return (
                                    <Fragment key={node.nodeName}>
                                        <dt className="ons-metadata__term ons-grid__col ons-col-3@m">{node.nodeName}:</dt>
                                        <dd className="ons-metadata__value ons-grid__col ons-col-8@m">
                                            <QuestionnaireStatus status={node.nodeStatus} />
                                        </dd>
                                    </Fragment>
                                );
                            })
                        }
                    </dl>
                </>
            </Collapsible>
        </>
    );
}

export default BlaiseNodeInfo;
