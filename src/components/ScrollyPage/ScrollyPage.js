import React, { useEffect, useState } from 'react';

import Caller from '../Caller';

/**
 * Page to show viz with scollytelling
 * @param {Object} props
 * @param {React.ReactElement} props.Content From .mdx file content
 * @param {String} props.title Page title
 * @returns {React.ReactElement}
 */

export default function ScrollyPage ({
    Content,
    title,
    ...props
}) {
    return (
        <Content components={{Caller}} />
    )
}