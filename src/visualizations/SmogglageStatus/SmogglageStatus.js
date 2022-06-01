import React, { useContext, useEffect } from 'react';

import AlluvialChart from '../../components/AlluvialChart'

export default function SmogglageStatus ({
    data: inputData,
    dimensions
}) {
    const data = inputData['smoggleur-statut.csv'];
    const steps = [
        'departure_fr',
        'is_smoggleur'
    ]

    return (
        <>
            <AlluvialChart { ...{ data, steps, dimensions } } />
        </>
    )
}