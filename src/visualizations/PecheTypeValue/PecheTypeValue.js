import React, { useContext } from 'react';

import BarChart from '../../components/BarChart';
import { formatNumber } from '../../utils/misc';
import translate from '../../utils/translate';

/**
 * Header contains navigation and…
 * @param {Object} props
 * @param {Array} props.data
 * @returns {React.ReactElement}
 */

export default function PecheTypeValue({
    data,
    lang,
    dimensions
}) {
    const { width, height } = dimensions;

    return (
        <BarChart
            { ...{
                data,
                width,
                height
            }}

            layout='stack'
            x={{
                field: 'annee',
                title: translate('PecheTypeValue', 'x', lang)
            }}
            y={{
                field: 'value',
                title: translate('PecheTypeValue', 'y', lang)
            }}
            color={{
                field: 'type_zone_peche'
            }}
            tooltip={
                (d) => translate('PecheTypeValue', 'tooltip', lang, {
                    value: formatNumber(d['value']),
                    year: d['annee']
                })
            }
        />
    )
}