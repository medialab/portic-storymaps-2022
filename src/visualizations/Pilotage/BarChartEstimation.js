import React, { useMemo, useEffect } from 'react';

import Tooltip from 'react-tooltip';
import { extent, max, min, mean } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisPropsFromTickScale } from 'react-d3-axis';
import translate from '../../utils/translate';

import DiagonalHatching from '../../components/DiagonalHatching';

import { formatNumber } from '../../utils/misc';

export default function PilotageLegend({
    data,
    lang,
    dimensions,
    colorPalette,
    projectionStats,
    yearPeriodForProjection,
    ...props
}) {
    const { width, height } = dimensions;

    const margin = {
        bottom: 60,
        left: 45,
        right: 10
    };
    const barFromBarChartWidth = 7;

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

    const {
        projectionPerYear,
        minProjectionPerYear,
        maxProjectionPerYear,
        meanProjectionPerYear
    } = projectionStats;

    console.log(projectionPerYear);

    const startYear = min(data, d => d['year']);
    const [startYearForProjection, endYearForProjection] = yearPeriodForProjection;

    const scaleYear = useMemo(function computeScaleFromYear() {
        const [minYear, maxYear] = extent(data, d => d['year']);
        return scaleLinear()
            .domain([minYear, maxYear])
            .range([margin.left, width - margin.right]);
    }, [data, width]);

    const scaleTotal = useMemo(function computeScaleFromValue() {
        const maxValue = max(data, d => d['total']);
        return scaleLinear()
            .domain([0, maxValue])
            .range([height - margin.bottom, margin.bottom]);
    }, [data, maxPilotage, height]);

    const scaleProjection = useMemo(function computeScaleFromProjectionValue() {
        return scaleLinear()
            .domain([minProjectionPerYear, maxProjectionPerYear])
            .range([height - margin.bottom, margin.bottom]);
    }, [minProjectionPerYear, maxProjectionPerYear, height]);

    useEffect(() => {
        Tooltip.rebuild();
    });

    return (
        <>
            <svg
                {...{ width, height }}
            >
                <DiagonalHatching id='diag-hatch' lineGap={4} strokeWidth={5} color={colorPalette['total']} />
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
                                <g
                                    key={i}
                                    transform={`translate(${yearY})`}
                                >
                                    <path
                                        d={`
                                        M ${0}, ${height - margin.bottom}
                                        V ${totalY}
                                        `}
                                        stroke={colorPalette['total']}
                                        strokeWidth={barFromBarChartWidth}
                                        data-for="bar-tooltip"
                                        data-tip={translate('Pilotage', 'tooltip_total', lang, { value: total, year })}
                                    />
                                    <path
                                        d={`
                                        M ${0}, ${height - margin.bottom}
                                        V ${pilotageY}
                                        `}
                                        stroke={colorPalette['sorties_pilotage']}
                                        strokeWidth={barFromBarChartWidth}
                                        data-for="bar-tooltip"
                                        data-tip={translate('Pilotage', 'tooltip_pilotage', lang, { value: sorties_pilotage, year })}
                                    />
                                    {
                                        year < startYearForProjection &&
                                        <g>
                                            <g
                                                data-for="bar-tooltip"
                                                data-tip={translate('Pilotage', 'tooltip_estimation', lang, {
                                                    value_min: formatNumber(Math.round(sorties_pilotage / maxPilotage)),
                                                    value_max: formatNumber(Math.round(sorties_pilotage / minPilotage)),
                                                    year
                                                }
                                                )}
                                            >
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
                                            <g transform={`translate(${barFromBarChartWidth - 3})`} className='moustach'>
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
                                                                    strokeWidth={3}
                                                                    opacity={0.1}
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
                                                                    strokeWidth={3}
                                                                    opacity={0.1}
                                                                    strokeLinecap='round'
                                                                />
                                                            )
                                                        }
                                                    })
                                                }
                                                <circle cx={0} cy={scaleProjection(sorties_pilotage / (meanPilotage * 100))} r={4} fill='black' />
                                            </g>
                                        </g>
                                    }
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
                                    <text
                                        fontSize={11}
                                        x={0}
                                        y={0}
                                        textAnchor='end'
                                    >{formatNumber(value)}</text>
                                </g>
                            )
                        })
                    }
                </g>
                <g
                    className='ticks-x'
                    transform={`translate(${0}, ${height - margin.bottom})`}
                >
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
                                        transform='translate(0, 20) rotate(-45)'
                                        fontSize={11}
                                        x={0}
                                        y={0}
                                        textAnchor='middle'
                                    >{year}</text>
                                </g>
                            )
                        })
                    }
                </g>
                <g className='body-axis'>
                    {
                        axisPropsFromTickScale(scaleTotal, 3).values.map((value, i) => {
                            return (
                                <path key={i} className='ticks-x-bar' d={`M${margin.left - 15},${scaleTotal(value)} H${width}`} stroke='gray' strokeWidth={0.5} />
                            )
                        })
                    }
                </g>
                <g className='footer' transform={`translate(0, ${height})`}>
                    <g className='footer-projection'>
                        <path
                            d={`M${scaleYear(startYear)},${-15} H${scaleYear(startYearForProjection) - 5}`}
                            stroke='black'
                        />
                        <foreignObject
                            y={-25}
                            x={130}
                            width={250}
                            height={20}
                        >
                            <p
                                xmlns="http://www.w3.org/1999/xhtml"
                                style={{
                                    fontSize: 10,
                                    border: '1px solid black',
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                    backgroundColor: 'white',
                                    display: 'inline-block'
                                }}
                            >{translate('Pilotage', 'footer_projection', lang, { year_start: startYearForProjection, year_end: endYearForProjection })}</p>
                        </foreignObject>
                    </g>
                    <g className='footer-register'>
                        <path
                            d={`M${scaleYear(startYearForProjection) + 5},${-15} H${scaleYear(endYearForProjection)}`}
                            stroke='black'
                        />
                        <foreignObject
                            y={-25}
                            x={scaleYear(startYearForProjection) + 100}
                            width={250}
                            height={20}
                        >
                            <p
                                xmlns="http://www.w3.org/1999/xhtml"
                                style={{
                                    fontSize: 10,
                                    color: 'white',
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                    backgroundColor: 'black',
                                    display: 'inline-block'
                                }}
                            >{translate('Pilotage', 'footer_register', lang)}</p>
                        </foreignObject>
                    </g>
                </g>
            </svg>
            <Tooltip id="bar-tooltip" />
        </>
    )
}