import React, { useContext } from 'react';

import BarChart from '../../components/BarChart';
import translate from '../../utils/translate';

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
                    title: translate('SmogglagePortsStats', 'x1', lang),
                }}
                y={{
                    field: 'total des trajets anglais',
                    title: translate('SmogglagePortsStats', 'y1', lang),
                    // domain: [0, 100],
                    tickFormat: f => translate('SmogglagePortsStats', 'y1_ticks', lang, {value: f})
                }}
                tooltip={item => 
                  translate('SmogglagePortsStats', 'tooltip', lang, {
                    travels: item['total des trajets anglais'],
                    port: item['port de départ']
                  })
                }
                
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
                    title: translate('SmogglagePortsStats', 'x2', lang)
                }}
                y={{
                    field: '% de trajets anglais smoggleurs',
                    title: translate('SmogglagePortsStats', 'y2', lang),
                    domain: [0, 100],
                    tickFormat: f => f + '%'
                }}
                tooltip={item => 
                  translate('SmogglagePortsStats', 'tooltip', lang, {
                    travels: item['total des trajets anglais'],
                    port: item['port de départ']
                  })
                }
                
            />
        </>
    )
}