import React, { useMemo } from "react";

import LineChart from "../../components/LineChart";
import { formatNumber } from "../../utils/misc";

export default function EvolutionTypeConges({
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
                field: 'année',
                title: 'années'
            }}
            y={{
                field: 'valeur',
                title: 'valeur en livres tournois'
            }}
            color={{
                field: 'type'
            }}
            tooltip={(d) => `Congé d'une valeur de ${formatNumber(d['valeur'])} livres tournois en ${d['année']}`}
        />
    )
}