import {useContext, useEffect, useRef, useState} from 'react';
import omit from 'lodash/omit';
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
    const isBlank = visualizationId === undefined;

    const {
        onRegisterVisualization,
        onClickCallerScroll
    } = useContext(VisualisationContext);

    useEffect(() => {
        if (isInvalid || isBlank) { return; }

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

    if (isInvalid) {
        return (
            <div
                ref={ref}
                id={visualizationId}
                className={'Caller is-invalid'}
            >
                {
                    process.env.NODE_ENV === 'development' &&
                    <span>Caller viz
                        <code>{visualizationId}</code> :  <code>{JSON.stringify({...omit(props, 'children')})}</code>
                    </span>
                }
            </div>
        )
    }

    return (
        <div
            ref={ref}
            id={visualizationId}
            className='Caller'
            onClick={(e) => onClickCallerScroll(ref)}
        >
            {
                process.env.NODE_ENV === 'development' &&
                <span>Caller viz
                    <code>{visualizationId}</code> : <code>{JSON.stringify({...omit(props, 'children')})}</code>
                </span>
            }
        </div>
    )
}