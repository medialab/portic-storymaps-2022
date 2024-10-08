import React, { useMemo } from "react";

import LineChart from "../../components/LineChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';

export default function EvolutionTypeConges({
    data: inputData,
    dimensions,
    lang,
    ...props
}) {
    const { width, height } = dimensions;

    const data = useMemo(() => {
      return inputData.map(datum => ({
        ...datum,
        type: translate('EvolutionTypeConges', datum.type, lang)
      }))
    }, [inputData, lang])

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
                tickFormat: (value, valueIndex) => formatNumber(value, lang)
            }}

            annotations={[
              {
                axis: 'x',
                start: 1778,
                end: 1783,
                label: translate('EvolutionTypeConges', 'us_war', lang),
              }
            ]}
            color={{
                field: 'type',
                palette: [
                  'pêche',
                  'cabotage (pav. fr)',
                  'Isles (pav. fr)',
                  'long-cours (pav. fr)',
                  'guerre et marchandises (pav. fr)',
                  'cabotage (étrangers)',
                  'long-cours (étrangers)',
                ].reduce((res, key) => ({
                  ...res,
                  [translate('EvolutionTypeConges', key, lang)]: translate('EvolutionTypeConges', key, 'color')
                }), {})
                //  {
                //   'pêche': 'rgb(238, 222, 113)',
                //   'cabotage (pav. fr)': '#668EDB',
                //   'Isles (pav. fr)': '#41BEA3',
                //   'long-cours (pav. fr)': '#A7E6F9',
                //   'guerre et marchandises (pav. fr)': '#514EEE',
                //   'cabotage (étrangers)': '#E5881A',
                //   'long-cours (étrangers)': '#875E2E',
                // }
            }}
            tooltip={
              d => formatNumber(d['valeur'], lang)
                // (d) => translate('EvolutionTypeConges', 'tooltip', lang, {
                //     value: formatNumber(d['valeur'], lang),
                //     year: d['année'],
                //     type: d['type']
                // })
            }
        />
    )
}