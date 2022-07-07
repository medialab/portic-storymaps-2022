import React, { useMemo } from "react";

import { extent, max, mean } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import translate from '../../utils/translate';

import DiagonalHatching from '../../components/DiagonalHatching';

export default function SchemaDemonstration({
    lang,
    data,
    dimensions,
    colorPalette,
    projectionStats,
    ...props
}) {
    const { width, height } = dimensions;

    const margin = {
        bottom: 30,
        left: 15,
        right: 85
    };
    const barFromBarChartWidth = 7;
    const topTexteHeight = 50;

    const {
        projectionPerYear,
        minProjectionPerYear,
        maxProjectionPerYear,
        meanProjectionPerYear
    } = projectionStats;

    const scaleYear = useMemo(function computeScaleFromYear() {
        const [minYear, maxYear] = extent(data, d => d['year']);
        return scaleLinear()
            .domain([minYear, maxYear])
            .range([margin.left, width - margin.right]);
    }, [data, width]);

    const scaleProjection = useMemo(function computeScaleFromProjectionValue() {
        return scaleLinear()
            .domain([minProjectionPerYear, maxProjectionPerYear])
            .range([height - topTexteHeight - margin.bottom, margin.bottom]);
    }, [minProjectionPerYear, maxProjectionPerYear, height]);

    return (
        <svg {...{ width, height }} >
            <DiagonalHatching id='diag-hatch' lineGap={4} strokeWidth={5} color={colorPalette['total']} />
            <foreignObject
                y={0}
                x={0}
                width={width}
                height={80}
            >
                <p
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{ fontSize: 14, }}
                >{translate('Pilotage', 'description_demonstration', lang, { value_max: maxProjectionPerYear, value_min: minProjectionPerYear })}</p>
            </foreignObject>

            <g className='chart' transform={`translate(${0}, ${topTexteHeight})`}>
                <g className='bars'>
                    {
                        projectionPerYear.map(({ year, realityGapPourcentage }, i) => {
                            return (
                                <g
                                    key={i}
                                    transform={`translate(${scaleYear(year)})`}
                                >
                                    {
                                        realityGapPourcentage >= 0 &&
                                        <path
                                            d={`
                                            M ${0}, ${scaleProjection(0)}
                                            V ${scaleProjection(realityGapPourcentage)}
                                            `}
                                            stroke={colorPalette['total']}
                                            strokeWidth={barFromBarChartWidth}
                                        />
                                    }
                                    {
                                        realityGapPourcentage < 0 &&
                                        <path
                                            d={`
                                            M ${0}, ${scaleProjection(realityGapPourcentage)}
                                            V ${scaleProjection(0)}
                                            `}
                                            stroke='url(#diag-hatch)'
                                            strokeWidth={barFromBarChartWidth}
                                        />
                                    }
                                </g>
                            )
                        })
                    }
                </g>
                <g
                    className='ticks-x'
                    transform={`translate(${0}, ${scaleProjection(0)})`}
                >
                    <path className='ticks-x-bar' d={`M${margin.left - 15},${0} H${width - 70}`} stroke='black' />
                    {
                        projectionPerYear.map(({ year, realityGapPourcentage }, i) => {
                            const showTitle = i % 5 === 0;
                            return (
                                <g
                                    transform={`translate(${scaleYear(year)}, ${0})`}
                                    className='ticks-x-item'
                                    key={i}
                                >
                                    {
                                        realityGapPourcentage >= 0 &&
                                        <g>
                                            <path
                                                d={`
                                                    M ${0}, ${0}
                                                    v ${5}
                                                `}
                                                stroke='black'
                                                strokeWidth={1}
                                            />
                                            {
                                                showTitle &&
                                                <text
                                                    transform='translate(0, 20) rotate(-45)'
                                                    fontSize={11}
                                                    x={0}
                                                    y={0}
                                                    textAnchor='middle'
                                                >{year}</text>
                                            }
                                        </g>

                                    }
                                    {
                                        realityGapPourcentage < 0 &&
                                        <g>
                                            <path
                                                d={`
                                                    M ${0}, ${0}
                                                    v -${5}
                                                `}
                                                stroke='black'
                                                strokeWidth={1}
                                            />
                                            {
                                                showTitle &&
                                                <text
                                                    transform='translate(0, -15) rotate(-45)'
                                                    fontSize={11}
                                                    x={0}
                                                    textAnchor='middle'
                                                >{year}</text>
                                            }
                                        </g>
                                    }
                                </g>
                            )
                        })
                    }
                </g>
                <g
                    className='ticks-y'
                    transform={`translate(${width - (margin.right - 20)}, ${0})`}
                >
                    <g className='bar-combined'>
                        <circle cx={0} cy={scaleProjection(0)} r={5} />
                        <text x={7} y={scaleProjection(0)} fontSize={12}>Moyenne</text>
                        {
                            projectionPerYear.map(({ realityGapPourcentage }) => {
                                if (realityGapPourcentage >= 0) {
                                    return (
                                        <path
                                            d={`
                                            M0,${scaleProjection(realityGapPourcentage)}
                                            V${scaleProjection(0)}
                                            `}
                                            stroke='black'
                                            strokeWidth={5}
                                            opacity={0.2}
                                            strokeLinecap='round'
                                        />
                                    )
                                } else {
                                    return (
                                        <path
                                            d={`
                                            M0,${scaleProjection(0)}
                                            V${scaleProjection(realityGapPourcentage)}
                                            `}
                                            stroke='black'
                                            strokeWidth={5}
                                            opacity={0.2}
                                            strokeLinecap='round'
                                        />
                                    )
                                }
                            })
                        }
                    </g>
                    {
                        [minProjectionPerYear, maxProjectionPerYear].map((value, i) => {
                            return (
                                <g
                                    transform={`translate(${0}, ${scaleProjection(value)})`}
                                    className='ticks-y-item'
                                    key={i}
                                >
                                    <text
                                        transform={`translate(10) rotate(90)`}
                                        fontSize={11}
                                        x={0}
                                        y={0}
                                        textAnchor={value === minProjectionPerYear ? 'end' : 'start'}
                                    >{value}%</text>
                                </g>
                            )
                        })
                    }
                </g>
            </g>
        </svg>
    )
}