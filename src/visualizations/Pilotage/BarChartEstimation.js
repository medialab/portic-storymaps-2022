import React, { useMemo } from 'react';

import { extent, max, mean } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisPropsFromTickScale } from 'react-d3-axis';

import { formatNumber } from '../../utils/misc';

export default function PilotageLegend({
    data,
    lang,
    dimensions,
    colorPalette,
    ...props
}) {
    const { width, height } = dimensions;

    const margin = {
        bottom: 20,
        left: 45
    };
    const barFromBarChartWidth = 5;

    const scaleYear = useMemo(function computeScaleFromYear() {
        const [minYear, maxYear] = extent(data, d => d['year']);
        return scaleLinear()
            .domain([minYear, maxYear])
            .range([margin.left, width]);
    }, [data, width]);

    const scaleTotal = useMemo(function computeScaleFromValue() {
        const maxValue = max(data, d => d['total']);
        return scaleLinear()
            .domain([0, maxValue])
            .range([height - margin.bottom, 0]);
    }, [data, height]);

    return (
        <svg
            {...{ width, height }}
        >
            <defs>
                <marker id='arrow-top' orient='-270deg' markerWidth='10' markerHeight='6' refX='0.1' refY='2'>
                    <path d='M0,0 V4 L2,2 Z' fill='gray' />
                </marker>
                <marker id='arrow-bottom' orient='270deg' markerWidth='10' markerHeight='6' refX='0.1' refY='2'>
                    <path d='M0,0 V4 L2,2 Z' fill='gray' />
                </marker>
            </defs>
            <g className='bars'>
                {
                    data.map(({ year, sorties_pilotage, total }, i) => {
                        const totalY = scaleTotal(total);
                        const pilotageY = scaleTotal(sorties_pilotage);
                        const yearY = scaleYear(year);
                        return (
                            <g key={i} transform={`translate(${yearY - (barFromBarChartWidth)})`} >
                                <path
                                    d={`
                                    M ${barFromBarChartWidth}, ${height - margin.bottom}
                                    V ${totalY}
                                    `}
                                    stroke={colorPalette['total']}
                                    strokeWidth={barFromBarChartWidth}
                                />
                                <path
                                    d={`
                                    M ${barFromBarChartWidth}, ${height - margin.bottom}
                                    V ${pilotageY}
                                    `}
                                    stroke={colorPalette['sorties_pilotage']}
                                    strokeWidth={barFromBarChartWidth}
                                />
                                <g transform={`translate(${barFromBarChartWidth * 2})`}>
                                    <path
                                        d={`
                                        M ${0}, ${height - margin.bottom - 40}
                                        V ${100}
                                        `}
                                        stroke='gray'
                                        strokeWidth={1.5}
                                        markerEnd='url(#arrow-top)'
                                        markerStart='url(#arrow-bottom)'
                                    />
                                    <circle cx={0} cy={height - margin.bottom - 110} r={2} fill='gray' />
                                </g>
                            </g>
                        )
                    })
                }
            </g>
            <g
                className='ticks-y'
                transform={`translate(${margin.left - 15}, ${0})`}
            >
                <path className='ticks-y-bar' d={`M${5},${0} V${height - margin.bottom}`} stroke='black' />
                {
                    axisPropsFromTickScale(scaleTotal, 15).values.map((value, i) => {
                        return (
                            <g
                                transform={`translate(${0}, ${scaleTotal(value)})`}
                                className='ticks-y-item'
                                key={i}
                            >
                                <path
                                    d={`
                                        M ${5}, ${0}
                                        h ${-5}
                                        `}
                                    stroke='black'
                                    strokeWidth={1}
                                />
                                {
                                    (i % 3 === 0) &&
                                    <text
                                        fontSize={11}
                                        x={0}
                                        y={0}
                                        textAnchor='end'
                                    >{formatNumber(value)}</text>
                                }
                            </g>
                        )
                    })
                }
            </g>
            <g
                className='ticks-x'
                transform={`translate(${0}, ${height - margin.bottom})`}
            >
                <path className='ticks-x-bar' d={`M${margin.left - 15},${0} H${width}`} stroke='black' />
                {
                    data.map(({ year }, i) => {
                        return (
                            <g
                                transform={`translate(${scaleYear(year)}, ${0})`}
                                className='ticks-x-item'
                                key={i}
                            >
                                <path
                                    d={`
                                        M ${0}, ${0}
                                        v ${5}
                                    `}
                                    stroke='black'
                                    strokeWidth={1}
                                />
                                <text
                                    fontSize={6}
                                    x={0}
                                    y={20}
                                >{formatNumber(year)}</text>
                            </g>
                        )
                    })
                }
            </g>
        </svg>
    )
}