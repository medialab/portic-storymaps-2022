import React, { useContext } from 'react';

import BarChart from '../../components/BarChart';

/**
 * Header contains navigation and…
 * @param {Object} props
 * @param {Array} props.data
 * @returns {React.ReactElement}
 */

export default function PecheTypeValue({
    data: inputData,
    title,
    lang
}) {
    let data = inputData['peche-type-value.csv'];

    return (
        <BarChart
            data={data}
            title={title}
            width={window.innerWidth - 20}
            layout='stack'
            x={{
                field: 'annee',
                title: 'Année'
            }}
            y={{
                field: 'value',
                title: 'port de départ'
            }}
            color={{
                field: 'type_zone_peche',
                title: 'Type de pêche'
            }}
            tooltip={item => `Année ${item['annee']} : valeur ${item['value']}`}
        />
    )
}