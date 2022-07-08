import React, { useMemo, useEffect } from "react";

import Tooltip from 'react-tooltip';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import translate from '../../utils/translate';

import DiagonalHatching from '../../components/DiagonalHatching';
import ArrowNote from "../../components/ArrowNote";

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
        left: 180,
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

    useEffect(() => {
        Tooltip.rebuild();
    });

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

            <marker id='arrow-note-head' orient='auto' markerWidth='10' markerHeight='6' refX='0.1' refY='2'>
                <path d='M0,0 V4 L2,2 Z' fill='black' />
            </marker>

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
                                            data-for="bar-tooltip"
                                            data-tip={translate('Pilotage', 'tooltip_projection', lang, { value: realityGapPourcentage.toFixed(2), year })}
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
                                            data-for="bar-tooltip"
                                            data-tip={translate('Pilotage', 'tooltip_projection', lang, { value: realityGapPourcentage.toFixed(2), year })}
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
                <g className='notes'>
                <ArrowNote
                    arrowId='arrow-note-head'
                    textWidth={130}
                    textHeight={40}
                    x1={0}
                    y1={80}
                    x2={margin.left - 20}
                    y2={scaleProjection(0)}
                    text={translate('Pilotage', 'note_schema_mean', lang)}
                />
                <ArrowNote
                    arrowId='arrow-note-head'
                    textWidth={160}
                    textHeight={40}
                    x1={20}
                    y1={20}
                    x2={scaleYear(1772)}
                    y2={80}
                    text={translate('Pilotage', 'note_schema_sup', lang)}
                />
                <ArrowNote
                    arrowId='arrow-note-head'
                    textWidth={280}
                    textHeight={20}
                    x1={20}
                    y1={220}
                    x2={scaleYear(1789)}
                    y2={200}
                    text={translate('Pilotage', 'note_schema_inf', lang)}
                />
            </g>
            </g>
        </svg>
    )
}