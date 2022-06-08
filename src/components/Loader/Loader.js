import React from 'react';

/**
 * Header contains navigation and…
 * @param {Object} props
 * @param {String} props.message Text to show as loading message
 * @returns {React.ReactElement}
 */

export default function Loader({
    message
}) {
    return (
        <div>
            {message}
        </div>
    );
}