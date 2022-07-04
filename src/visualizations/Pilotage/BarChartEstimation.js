import React, { useMemo } from 'react';

import { extent, min, max, mean } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisPropsFromTickScale } from 'react-d3-axis';

import DiagonalHatching from '../../components/DiagonalHatching';

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
        left: 45,
        right: 10
    };
    const barFromBarChartWidth = 8;

    // const data = useMemo(function prepareData() {
    //     return inputData.map((row) => {
    //         const { sorties_pilotage, total } = row;
    //         if (sorties_pilotage === undefined || total === undefined) {
    //             return row;
    //         }
    //         return {
    //             ...row,
    //             rapport: sorties_pilotage / total
    //         }
    //     })
    // }, [inputData])

    // console.table(data)

    const {
        meanPilotage,
        minPilotage,
        maxPilotage
    } = useMemo(() => {
        return {
            meanPilotage: mean(data, d => d['sorties_pilotage'] / d['total']),
            minPilotage: min(data, d => d['sorties_pilotage'] / d['total']),
            maxPilotage: max(data, d => d['sorties_pilotage'] / d['total'])
        }
    }, [data]);

    const scaleYear = useMemo(function computeScaleFromYear() {
        const [minYear, maxYear] = extent(data, d => d['year']);
        return scaleLinear()
            .domain([minYear, maxYear])
            .range([margin.left, width - margin.right]);
    }, [data, width]);

    const scaleTotal = useMemo(function computeScaleFromValue() {
        const maxValue = max(data, d => d['total']);
        return scaleLinear()
            .domain([0, (maxValue / maxPilotage)])
            .range([height - margin.bottom, 0]);
    }, [data, height]);

    return (
        <svg
            {...{ width, height }}
        >
            <DiagonalHatching id='diag-hatch' lineGap={2} color='red' />
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
                        if (sorties_pilotage == undefined && total == undefined) {
                            return null;
                        }

                        const totalY = scaleTotal(total);
                        const pilotageY = scaleTotal(sorties_pilotage);
                        const pilotageMaxY = scaleTotal(sorties_pilotage / maxPilotage);
                        const pilotageMinY = scaleTotal(sorties_pilotage / minPilotage);
                        const pilotageMeanY = scaleTotal(sorties_pilotage / meanPilotage);
                        const yearY = scaleYear(year);
                        return (
                            <g key={i} transform={`translate(${yearY})`} >
                                <path
                                    d={`
                                    M ${0}, ${height - margin.bottom}
                                    V ${totalY}
                                    `}
                                    stroke={colorPalette['total']}
                                    strokeWidth={barFromBarChartWidth}
                                />
                                <path
                                    d={`
                                    M ${0}, ${height - margin.bottom}
                                    V ${pilotageY}
                                    `}
                                    stroke={colorPalette['sorties_pilotage']}
                                    strokeWidth={barFromBarChartWidth}
                                />
                                <g>
                                    {
                                        totalY !== undefined &&
                                        <path
                                            d={`
                                            M ${0}, ${pilotageY}
                                            V ${max([pilotageMeanY, totalY])}
                                            `}
                                            stroke='#ffb2ad'
                                            strokeWidth={barFromBarChartWidth}
                                        />
                                    }
                                    <path
                                        d={`
                                        M ${0}, ${pilotageY}
                                        V ${pilotageMeanY}
                                        `}
                                        stroke='url(#diag-hatch)'
                                        strokeWidth={barFromBarChartWidth}
                                    />
                                </g>
                                <g transform={`translate(${barFromBarChartWidth - 5})`} className='moustach'>
                                    <path
                                        d={`
                                        M ${0}, ${pilotageMaxY}
                                        V ${pilotageMinY}
                                        `}
                                        stroke='gray'
                                        strokeWidth={1.5}
                                        markerEnd='url(#arrow-top)'
                                        markerStart='url(#arrow-bottom)'
                                    />
                                    <circle cx={0} cy={pilotageMeanY} r={2} fill='gray' />
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
                                >{year}</text>
                            </g>
                        )
                    })
                }
            </g>
        </svg>
    )
}