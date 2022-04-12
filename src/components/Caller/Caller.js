import {useContext, useEffect, useRef, useState} from 'react';
import {v4 as genId} from 'uuid';

import { VisualisationContext } from '../../utils/contexts';

/**
 * Viz caller, the place of the viz in contents
 * @param {Object} props Viz parameters
 * @param {String} props.id Viz id
 * @returns {React.ReactElement}
 */

export default function Caller ({
    id: visualizationId,
    className,
    ...props
}) {
    const ref = useRef(null);
    /** @type {[String, Function]} */
    const [callerId, setCallerId] = useState(genId());
    const isInvalid = className === 'is-invalid';

    const {
        onRegisterVisualization,
        onClickCallerScroll
    } = useContext(VisualisationContext);

    useEffect(() => {
        setTimeout(() => {
            // we wrap callback in a setTimeout in order to have a non-null ref to the HTML element
            onRegisterVisualization({
                ...props,
                ref,
                visualizationId,
                callerId
            });
        });
    }, [callerId]);

    return (
        <div
            ref={ref}
            className={'Caller ' + (isInvalid ? 'is-invalid' : '')}
            onClick={(e) => onClickCallerScroll(ref)}
        >
            {
                process.env.NODE_ENV === 'development' &&
                <span>Caller viz
                    <code>{visualizationId}</code> : <code>{JSON.stringify({...props})}</code>
                </span>
            }
        </div>
    )
}