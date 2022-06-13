import React, { useMemo } from 'react';

import LineChart from '../../components/LineChart';
import { formatNumber } from "../../utils/misc";

export default function EvolutionBudgetDunkerque({
    data,
    dimensions,
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
                field: 'Années comptables'
            }}
            y={{
                field: 'valeur',
                title: 'valeur en livres tournois'
            }}
            color={{
                field: 'référence'
            }}
            tooltip={(d) => `${d['référence']} d'une valeur de ${formatNumber(d['valeur'])} livres tournois en ${d['Années comptables']}`}
        />
    )
}