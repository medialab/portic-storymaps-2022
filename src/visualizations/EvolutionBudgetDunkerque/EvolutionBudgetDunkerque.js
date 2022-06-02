import React, { useMemo } from 'react';

import LineChart from '../../components/LineChart';

export default function EvolutionBudgetDunkerque({
    data: inputData,
    dimensions,
    ...props
}) {
    const { width, height } = dimensions;

    const data = useMemo(function prepareData() {
        let preparedData = inputData['evolution-budget-dunkerque.csv'].map((row) => {
            return {
                ['Années comptables']: +row['Années comptables'],
                ['Recettes']: +row['Recettes'],
                ['Dépenses']: +row['Dépenses'],
                ['Soldes comptables']: +row['Soldes comptables']
            }
        })
        return preparedData;
    }, [inputData]);

    console.log(data);

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
                field: 'Recettes'
            }}
        />
    )
}