import { group } from 'd3-array';
import React, { useEffect, useMemo, useState } from 'react';

import LineChart from '../../components/LineChart';

export default function TonnageMoyenMois({
    data: inputData,
    dimensions,
    ...props
}) {
    const { width, height } = dimensions;
    const [year, setYear] = useState(undefined);

    const data = useMemo(() => {
        return inputData
            .map(({ month, ...rest }) => {
                const mounths = Object.fromEntries([
                    'Janvier',
                    'Février',
                    'Mars',
                    'Avril',
                    'Mai',
                    'Juin',
                    'Juillet',
                    'Août',
                    'Septembre',
                    'Octobre',
                    'Novembre',
                    'Décembre'
                ].map((mounth, i) => [mounth, i]))
                return {
                    month: mounths[month],
                    ...rest
                }
            })
    }, [inputData]);

    const years = useMemo(function groupYears () {
        const yearGroup = group(data, d => d.year);
        return Array.from(yearGroup.keys());
    }, [data]);

    useEffect(function setInitialYear () {
        setYear(years[0]);
    }, [years]);

    function onInputChange(e) {
        const { target } = e;
        const { value } = target;
        setYear(value);
    }

    if (year === undefined) {
        return null;
    }

    return (
        <>
            <LineChart
                {...{
                    width,
                    height
                }}
                data={
                    data.filter(({ year: rowYear }) => year === rowYear)
                }
                x={{
                    field: 'month'
                }}
                y={{
                    field: 'value'
                }}
            />
            <form
                onSubmit={(e) => e.preventDefault()}
                style={{
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                {
                    years.map((inputYear, i) => (
                        <span key={i}>
                            <input
                                onChange={onInputChange}
                                type="radio"
                                id={`tonnage-moyen-mois_year_${inputYear}`}
                                name="year"
                                value={inputYear}
                                checked={year === inputYear}
                            />
                            <label htmlFor={`tonnage-moyen-mois_year_${inputYear}`}>{inputYear}</label>
                        </span>
                    ))
                }
            </form>
        </>
    )
}