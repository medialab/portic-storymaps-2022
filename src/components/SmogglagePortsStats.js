import React, { useContext } from 'react';

import BarChart from './BarChart';

import { SettingsContext } from '../utils/contexts';
import translate from '../utils/translate';

/**
 * Header contains navigation and…
 * @param {Object} props
 * @param {Array} props.data
 * @returns {React.ReactElement}
 */

export default function SmogglagePortsStats ({
    data
}) {
    const { lang } = useContext(SettingsContext);
    const title = translate('SmogglagePortsStats', 'title', lang);

    return (
        <>
            <h2 className='title'>{title}</h2>

            <BarChart
                data={data}
                title="Test de bar chart (fill gaps)"
                width={window.innerWidth - 20}
                x={{
                    field: 'port de départ',
                    title: 'port de départ'
                }}
                y={{
                    field: 'trajets anglais smoggleurs',
                    title: 'trajets anglais smoggleurs'
                }}
                tooltip={item => item['port de départ']}
            />

            <pre>
                <code>
                    {JSON.stringify(data, undefined, 4)}
                </code>
            </pre>
        </>
    )
}