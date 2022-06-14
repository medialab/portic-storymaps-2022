import React, { useMemo } from 'react';

import LineChart from '../../components/LineChart';
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';

export default function EvolutionBudgetDunkerque({
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
        />
    )
}