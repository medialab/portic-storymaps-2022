import React, { useContext } from 'react';

import LinearAlluvialChart from '../../components/LinearAlluvialChart'

export default function SmogglageStatus ({
    data,
    title,
    dimensions
}) {
    data = data['smoggleur-statut.csv'];
    const { width, height } = dimensions;

    const steps = [
        {
            field: "departure_fr",
            labels: {
              fr: 'port de départ',
              en: 'departure port'
            },
            filters: [],
            name: 'port'
        },
        {
            field: "is_smoggleur",
            labels: {
              fr: 'est un smoggleur',
              en: 'is smoggleur'
            },
            filters: [],
            name: 'smogglage'
        }
    ]

    return (
        <>
            <h3>{title}</h3>
            <LinearAlluvialChart { ...{ data, steps, width, height } } />
            {/* <pre>
                <code>
                    {JSON.stringify(data, undefined, 4)}
                </code>
            </pre> */}
        </>
    )
}