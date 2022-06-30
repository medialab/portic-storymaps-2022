import React, { useMemo } from 'react';
import BoatBarChart from './BoatBarChart';

export default function Pilotage({
    data: inputData,
    ...props
}) {
    const data = useMemo(function prepareData() {
        return inputData.map(({ year, sorties_pilotage, navires, total, ...rest }) => {
            return {
                ...rest,
                year: +year,
                sorties_pilotage: (sorties_pilotage === '' ? undefined : +sorties_pilotage),
                total: (total === '' ? undefined : +total)
            }
        })
    }, [inputData]);

    return (
        <>
            <BoatBarChart
                data={data.filter(({ total }) => total !== undefined )}
                dimensions={{
                    width: 400,
                    height: 400
                }}
            />
        </>
    )
}