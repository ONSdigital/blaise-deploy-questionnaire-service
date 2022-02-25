import { Instrument } from "blaise-api-node-client";
import { Collapsible } from "blaise-design-system-react-components";
import InstrumentStatus from "../../instrumentStatus";
import React, { Fragment, ReactElement } from "react";

interface NodeProps {
    instrument: Instrument;
}

function BlaiseNodeInfo({ instrument }: NodeProps): ReactElement {
    return (
        <>
            <Collapsible title="What are the questionnaire install states on the Blaise nodes?">
                <>
                    <h3 className="u-mt-m">Blaise Nodes</h3>
                    <dl className="metadata metadata__list grid grid--gutterless u-cf u-mb-l"
                        title="Questionnaire install state on the Blaise nodes"
                        aria-label="Questionnaire install state on the Blaise nodes">
                        {
                            instrument.nodes && instrument.nodes.map((node) => {
                                return (
                                    <Fragment key={node.nodeName}>
                                        <dt className="metadata__term grid__col col-3@m">{node.nodeName}:</dt>
                                        <dd className="metadata__value grid__col col-8@m">
                                            <InstrumentStatus status={node.nodeStatus} />
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
