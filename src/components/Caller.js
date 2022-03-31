import React, { useEffect, useState, useRef } from 'react';

/**
 * Fetch a visualisation on scroll
 * @param {Object} props
 * @param {String} props.id
 * @param {Boolean} props.willActive Show the linked viz at page launch
 * @returns {React.ReactElement}
 */

export default function Caller ({
    id,
    willActive = false,
    ...props
}) {
    const elt = useRef(null);

    const IsInDevMode = process.env.NODE_ENV === 'development',
        isClearFix = id === undefined;

    if (IsInDevMode) {
        return (
            <div className='caller' ref={elt} onClick={onClick}>
                Caller '{ id }'&nbsp;
                <code>{ JSON.stringify(props) }</code>
            </div>
        )
    }

    return <div className='caller'></div>
}