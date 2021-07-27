import {Instrument} from "../../../Interfaces";
import {Collapsible} from "blaise-design-system-react-components";
import InstrumentStatus from "../InstrumentStatus";
import React, {Fragment, ReactElement} from "react";

interface NodeProps {
    instrument: Instrument;
}

function BlaiseNodeInfo({instrument}: NodeProps): ReactElement {

    return (
        <>
            <Collapsible title="What is the questionnaire install state on Blaise nodes?">
                <>
                    <h3 className="u-mt-m">Blaise Nodes</h3>
                    <dl className="metadata metadata__list grid grid--gutterless u-cf u-mb-l"
                        title="Questionnaire install state on Blaise nodes"
                        aria-label="Questionnaire install state on Blaise nodes">
                        {
                            instrument.nodes && instrument.nodes.map((node) => {
                                return (
                                    <Fragment key={node.nodeName}>
                                        <dt className="metadata__term grid__col col-3@m">{node.nodeName}:</dt>
                                        <dd className="metadata__value grid__col col-8@m">
                                            <InstrumentStatus status={node.nodeStatus}/>
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
