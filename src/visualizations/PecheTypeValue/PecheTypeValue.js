import React, { useContext } from 'react';

import BarChart from '../../components/BarChart';
import { formatNumber } from '../../utils/misc';

/**
 * Header contains navigation and…
 * @param {Object} props
 * @param {Array} props.data
 * @returns {React.ReactElement}
 */

export default function PecheTypeValue({
    data,
    title,
    lang,
    dimensions
}) {
    const { width, height } = dimensions;

    return (
        <BarChart
            { ...{
                data,
                width,
                height
            }}

            layout='stack'
            x={{
                field: 'annee',
                title: 'Année'
            }}
            y={{
                field: 'value',
                title: 'valeur en livres tournois'
            }}
            color={{
                field: 'type_zone_peche',
                title: 'Type de pêche'
            }}
            tooltip={d => `Valeur de ${formatNumber(d['value'])} livres tournois en ${d['annee']}`}
        />
    )
}