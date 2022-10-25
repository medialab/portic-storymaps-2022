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
            tooltip={
                (d) => translate('EvolutionBudgetDunkerque', 'tooltip', lang, {
                    reference: d['référence'],
                    value: formatNumber(d['valeur']),
                    year: d['Années comptables']
                })
            }
            brushState={[brush, setBrush]}
        />
    )
}