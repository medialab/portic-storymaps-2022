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

            annotations={[
              {
                axis: 'x',
                start: 1778,
                end: 1781,
                label: 'Guerre d\'indépendance des USA'
              }
            ]}
            color={{
                field: 'type',
                palette: {
                  'pêche': 'rgb(238, 222, 113)',
                  'cabotage (pav. fr)': '#668EDB',
                  'Isles (pav. fr)': '#41BEA3',
                  'long-cours (pav. fr)': '#A7E6F9',
                  'guerre et marchandises (pav. fr)': '#514EEE',
                  'cabotage (étrangers)': '#E5881A',
                  'long-cours (étrangers)': '#875E2E',
                }
            }}
            tooltip={
                (d) => translate('EvolutionTypeConges', 'tooltip', lang, {
                    value: formatNumber(d['valeur']),
                    year: d['année'],
                    type: d['type']
                })
            }
        />
    )
}