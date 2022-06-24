import React, { useMemo } from "react";

import LineChart from "../../components/LineChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';

export default function EvolutionTypeConges({
    data,
    dimensions,
    lang,
    ...props
}) {
    const { width, height } = dimensions;

    return (
        <LineChart
            {...{
                data,
                width,
                height
            }}
            x={{
                field: 'année',
                title: translate('EvolutionTypeConges', 'x', lang)
            }}
            y={{
                field: 'valeur',
                title: translate('EvolutionTypeConges', 'y', lang),
                tickFormat: (value, valueIndex) => formatNumber(value)
            }}
            color={{
                field: 'type'
            }}
            tooltip={
                (d) => translate('EvolutionTypeConges', 'tooltip', lang, {
                    value: formatNumber(d['valeur']),
                    year: d['année']
                })
            }
        />
    )
}