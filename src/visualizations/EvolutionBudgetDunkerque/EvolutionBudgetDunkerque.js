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
    const [brush, setBrush] = useReducer(reducerBrush, [undefined, undefined, undefined]);

    const data = useMemo(function filterData() {
        const { start, end, mouse } = brush;
        if (mouse !== 'up') {
            return inputData;
        }
        return inputData.filter((row) => +row['Années comptables'] >= start && +row['Années comptables'] <= end);
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
                title: translate('EvolutionBudgetDunkerque', 'y', lang)
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