import React, { useMemo } from "react";

import LineChart from "../../components/LineChart";

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
                field: 'année'
            }}
            y={{
                field: 'valeur'
            }}
            color={{
                field: 'type'
            }}
        />
    )
}