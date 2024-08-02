import React, { useContext, useMemo } from 'react';

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
    data: inputData,
    lang,
    dimensions
}) {
    const { width, height } = dimensions;
    const data = useMemo(() => inputData.map(datum => ({
      ...datum,
      type_zone_peche: translate('PecheMap', datum.type_zone_peche, lang)
    })), [inputData, translate, lang])
    return (
        <BarChart
            { ...{
                data,
                width,
                height
            }}

            layout='stack'
            margins={{
              left: 150
            }}
            x={{
                field: 'annee',
                tickSpan: 2,
                fillGaps: true,
                title: translate('PecheTypeValue', 'x', lang)
            }}
            y={{
                field: 'value',
                tickFormat: d => formatNumber(d),
                title: translate('PecheTypeValue', 'y', lang)
            }}
            color={{
                field: 'type_zone_peche',
                title: translate('PecheTypeValue', 'color', lang)
            }}

            tooltip={
                (d) => translate('PecheTypeValue', 'tooltip', lang, {
                    value: formatNumber(d['value']),
                    year: d['annee'],
                    zone: d['type_zone_peche']
                })
            }
        />
    )
}