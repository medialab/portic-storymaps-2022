import React, { useMemo } from 'react';

import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisPropsFromTickScale } from 'react-d3-axis';

export default function BoatBarChart({
    data,
    dimensions,
    ...props
}) {
    const { width, height } = dimensions;

    const margin = 60;
    const barWidth = 5

    const scaleYear = useMemo(function computeScaleFromYear() {
        const [minYear, maxYear] = extent(data, d => d['year']);
        return scaleLinear()
            .domain([minYear, maxYear])
            .range([margin, width - margin]);
    }, [data, width]);

    const scaleTotal = useMemo(function computeScaleFromValue() {
        const [minValue, maxValue] = extent(data, d => d['total']);
        return scaleLinear()
            .domain([0, maxValue])
            .range([margin, height]);
    }, [data, height]);

    // const toto = axisPropsFromTickScale(scaleValue, 2);
    // const toto = axisPropsFromTickScale(scaleYear, 6);

    return (
        <svg
            {...{ width, height }}
        >
            <g className='bars'>
                {
                    data.map(({ year, sorties_pilotage, total }, i) => {
                        const totalY = scaleTotal(total);
                        const pilotageY = scaleTotal(sorties_pilotage);
                        const yearY = scaleYear(year);
                        return (
                            <g>
                                <path
                                    d={`
                                M ${yearY - (barWidth / 2)}, ${height}
                                V ${pilotageY}
                                `}
                                    stroke='red'
                                    strokeWidth={barWidth}
                                />
                                <path
                                    d={`
                                M ${yearY - (barWidth / 2)}, ${height}
                                V ${totalY}
                                `}
                                    stroke='black'
                                    strokeWidth={barWidth}
                                />
                            </g>
                        )
                    })
                }
            </g>
            <g
            className='ticks-y'
            >
                <path d={`M${5},0 V${height}`} />
                {
                    axisPropsFromTickScale(scaleTotal, 15).values.map((value, i) => {
                        return (
                            <path
                                d={`
                            M ${20}, ${scaleTotal(value)}
                            H ${2}
                            `}
                                stroke='black'
                                strokeWidth={1}
                            />
                        )
                    })
                }
            </g>
        </svg>
    )
}