import {useContext, useEffect, useRef, useState} from 'react';
import omit from 'lodash/omit';
import cx from 'classnames';
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
    children,
    ...props
}) {
    const ref = useRef(null);
    /** @type {[String, Function]} */
    const [callerId, setCallerId] = useState(genId());
    const isInblock = className === 'is-inblock';
    const isInvalid = className === 'is-invalid';
    const isBlank = className === 'is-blank';

    const {
        onRegisterVisualization,
        onClickCallerScroll,
        focusedVizId
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

    if (isInblock) {
        return (
            <span className='Caller is-block'>{children}</span>
        )
    }

    return (
        <div
            ref={ref}
            id={visualizationId}
            className={cx('Caller', {
                'is-invalid': isInvalid,
                'is-blank': isBlank,
                'is-active': focusedVizId && focusedVizId === visualizationId
            })}
            onClick={(e) => onClickCallerScroll(ref)}
        >
            {
                process.env.NODE_ENV === 'development' &&
                <span>Caller viz&nbsp;
                    <code>{visualizationId}</code> : <code>{JSON.stringify({...omit(props, 'children')})}</code>
                </span>
            }
        </div>
    )
}