import React, { useMemo, useReducer } from 'react';

import LineChart from '../../components/LineChart';
import { formatNumber, reducerBrush } from "../../utils/misc";
import translate from '../../utils/translate';

export default function EvolutionBudgetDunkerque({
    data: inputData,
    dimensions,
    lang,
    ...props
}) {
    const { width, height } = dimensions;
    const [brush, setBrush] = useReducer(reducerBrush, {start: undefined, end: undefined, mouse: undefined});
    const data = useMemo(function filterData() {
        const { start = 1700, end = 1800, mouse } = brush;
        if (mouse !== undefined && mouse !== 'up') {
            return inputData.filter((row) => +row['Années comptables'] < 1793);
        }
        return inputData.filter((row) => +row['Années comptables'] < 1793 && +row['Années comptables'] >= start && +row['Années comptables'] <= end);
    }, [inputData, brush])

    return (
        <LineChart
            {...{
                data,
                width,
                height
            }}
            x={{
                field: 'Années comptables',
                title: translate('EvolutionBudgetDunkerque', 'x', lang)
            }}
            y={{
                field: 'valeur',
                title: translate('EvolutionBudgetDunkerque', 'y', lang),
                tickFormat: v => formatNumber(v),
            }}
            color={{
                field: 'référence'
            }}
            annotations={[
              {
                axis: 'x',
                start: 1740,
                end: 1748,
                label: 'Guerre de succession d\'Autriche',
              },
              {
                axis: 'x',
                start: 1701,
                end: 1713,
                label: 'Guerre de succession d\'Espagne',
              },
              {
                axis: 'x',
                start: 1756,
                end: 1763,
                label: 'Guerre de sept ans',
                labelPosition: dimensions.height / 7
              },
              
              {
                axis: 'x',
                start: 1778,
                end: 1783,
                label: 'Guerre d\'indépendance américaine',
                labelPosition: dimensions.height / 5 * 2.5
              }
            ]}
            tooltip={
                (d) => translate('EvolutionBudgetDunkerque', 'tooltip', lang, {
                    reference: d['référence'],
                    value: formatNumber(d['valeur']),
                    year: d['Années comptables']
                })
            }
            isBrushable
            brushState={[brush, setBrush]}
        />
    )
}