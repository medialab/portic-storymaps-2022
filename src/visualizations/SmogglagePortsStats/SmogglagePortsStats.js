import React, { useContext } from 'react';

import BarChart from '../../components/BarChart';

/**
 * Header contains navigation and…
 * @param {Object} props
 * @param {Array} props.data
 * @returns {React.ReactElement}
 */

export default function SmogglagePortsStats ({
    data,
    title,
    lang,
    dimensions
}) {
    const { width, height } = dimensions;
    return (
        <>
        <BarChart
                data={data}
                title={title}
                margins={{
                  left: 300,
                  bottom: 40
                }}

                { ...{
                    width,
                    height: height / 2
                }}
                /** @todo translate this */
                x={{
                    field: 'port de départ',
                    title: 'port de départ'
                }}
                y={{
                    field: 'total des trajets anglais',
                    title: 'nombre de départs de britanniques',
                    // domain: [0, 100],
                    tickFormat: f => f + ' trajets'
                }}
                tooltip={item => item['total des trajets anglais'] + ' trajets de navires anglais depuis le port de ' + item['port de départ']}
                
            />
            <BarChart
                data={data}
                title={title}
                margins={{
                  left: 300,
                  bottom: 40
                }}

                { ...{
                    width,
                    height: height / 2
                }}
                /** @todo translate this */
                x={{
                    field: 'port de départ',
                    title: 'port de départ'
                }}
                y={{
                    field: '% de trajets anglais smoggleurs',
                    title: 'part des smoggleurs dans les trajets anglais',
                    domain: [0, 100],
                    tickFormat: f => f + '%'
                }}
                tooltip={item => item['total des trajets anglais'] + ' trajets de navires anglais depuis le port de ' + item['port de départ']}
                
            />
        </>
    )
}