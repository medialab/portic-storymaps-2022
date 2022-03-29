import React, { useContext } from 'react';

import { SettingsContext } from '../utils/contexts';
import translate from '../utils/translate';

import Mdx, { description } from '../content/about.mdx'

export default function About ({
    ...props
}) {
    const { lang } = useContext(SettingsContext);

    return (
        <>
            <h1 className='title'>{ translate('about', 'title', lang) }</h1>
            <p>{ description }</p>
            <Mdx />
        </>
    );
}