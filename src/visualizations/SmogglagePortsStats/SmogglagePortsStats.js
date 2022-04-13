import React, { useContext } from 'react';

import BarChart from '../../components/BarChart';

import { SettingsContext } from '../../utils/contexts';
import translate from '../../utils/translate';

/**
 * Header contains navigation and…
 * @param {Object} props
 * @param {Array} props.data
 * @returns {React.ReactElement}
 */

export default function SmogglagePortsStats ({
    data,
    title
}) {
    data = data['smogglage_ports_stats.csv'];

    return (
        <>
            <BarChart
                data={data}
                title={title}
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
        </>
    )
}