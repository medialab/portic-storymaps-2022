import React, { useMemo } from 'react';

import { extent, max, mean } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisPropsFromTickScale } from 'react-d3-axis';

import { formatNumber } from '../../utils/misc';
import translate from '../../utils/translate';

export default function BoatBarChart({
    data,
    lang,
    dimensions,
    colorPalette,
    ...props
}) {
    const { width, height } = dimensions;

    const margin = {
        bottom: 20,
        left: 60
    };
    const barFromBarChartWidth = 4;
    const rightBarSpace = 180;
    const barChartWidth = width - rightBarSpace

    const scaleYear = useMemo(function computeScaleFromYear() {
        const [minYear, maxYear] = extent(data, d => d['year']);
        return scaleLinear()
            .domain([minYear, maxYear])
            .range([margin.left, barChartWidth]);
    }, [data, barChartWidth]);

    const scaleTotal = useMemo(function computeScaleFromValue() {
        const maxValue = max(data, d => d['total']);
        return scaleLinear()
            .domain([0, maxValue])
            .range([height - margin.bottom, 0]);
    }, [data, height]);

    const meanPilotage = useMemo(function computeMeanPilotage() {
        let payload = mean(data, d => (100 * d['sorties_pilotage']) / d['total']);
        payload = payload.toFixed(2);
        return payload;
    }, [data])

    const maxValueScalePilotage = scaleTotal(max(data, d => d['sorties_pilotage']));

    return (
        <svg
            {...{ width, height }}
        >
            <g
                className='rightbar'
                transform={`translate(${barChartWidth + 40}, 0)`}
            >
                <g className='bar' >
                    {
                        data.map(({ year, sorties_pilotage, total }, i) => {
                            const totalY = scaleTotal(total);
                            const pilotageY = scaleTotal(sorties_pilotage);
                            const yearY = scaleYear(year);
                            return (
                                <g>
                                    <path
                                        d={`
                                        M ${0}, ${height - margin.bottom}
                                        V ${totalY}
                                        `}
                                        stroke={colorPalette['total']}
                                        strokeWidth={20}
                                        opacity={0.4}
                                    />
                                    <path
                                        d={`
                                        M ${0}, ${height - margin.bottom}
                                        V ${pilotageY}
                                        `}
                                        stroke={colorPalette['sorties_pilotage']}
                                        strokeWidth={20}
                                        opacity={0.4}
                                    />
                                </g>
                            )
                        })
                    }
                </g>
                <g
                    className='description'
                    transform={`translate(${10}, 0)`}
                >
                    <path
                        className='description-total'
                        d={`
                        M 0,0
                        h 10
                        V ${maxValueScalePilotage}
                        h -10
                        `}
                        stroke={colorPalette['total']}
                        strokeWidth={0.5}
                        fill='transparent'
                    />
                    <path
                        className='description-pilotage'
                        d={`
                        M 0,${maxValueScalePilotage}
                        h 20
                        V ${height - margin.bottom}
                        h -20
                        `}
                        stroke={colorPalette['sorties_pilotage']}
                        strokeWidth={0.5}
                        fill='transparent'
                    />
                    <path
                        className='description-pilotage-queue'
                        d={`
                        M 20,${maxValueScalePilotage + 50}
                        h 10
                        `}
                        stroke={colorPalette['sorties_pilotage']}
                        strokeWidth={0.5}
                        fill='transparent'
                    />
                    <foreignObject
                            y={maxValueScalePilotage - 10}
                            x={35}
                            width={90}
                            height={110}
                        >
                            <p
                                xmlns="http://www.w3.org/1999/xhtml"
                                style={{ fontSize: 11, }}
                            >{translate('Pilotage', 'description_pilotage', lang, { mean: meanPilotage })}</p>
                    </foreignObject>
                </g>
            </g>
            <g className='barchart'>
                <g className='bars'>
                    {
                        data.map(({ year, sorties_pilotage, total }, i) => {
                            const totalY = scaleTotal(total);
                            const pilotageY = scaleTotal(sorties_pilotage);
                            const yearY = scaleYear(year);
                            return (
                                <g key={i} transform={`translate(${barFromBarChartWidth / 2})`} >
                                    <path
                                        d={`
                                        M ${yearY - (barFromBarChartWidth / 2)}, ${height - margin.bottom}
                                        V ${totalY}
                                        `}
                                        stroke={colorPalette['total']}
                                        strokeWidth={barFromBarChartWidth}
                                    />
                                    <path
                                        d={`
                                        M ${yearY - (barFromBarChartWidth)}, ${totalY}
                                        H ${barChartWidth - (barFromBarChartWidth / 2) + 50}
                                        `}
                                        stroke={colorPalette['total']}
                                        strokeWidth={1}
                                    />

                                    <path
                                        d={`
                                        M ${yearY - (barFromBarChartWidth / 2)}, ${height - margin.bottom}
                                        V ${pilotageY}
                                        `}
                                        stroke={colorPalette['sorties_pilotage']}
                                        strokeWidth={barFromBarChartWidth}
                                    />
                                    <path
                                        d={`
                                        M ${yearY - (barFromBarChartWidth)}, ${pilotageY}
                                        H ${barChartWidth - (barFromBarChartWidth / 2) + 50}
                                        `}
                                        stroke={colorPalette['sorties_pilotage']}
                                        strokeWidth={1}
                                    />
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
                                            fontSize={14}
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
                    <path className='ticks-x-bar' d={`M${margin.left - 15},${0} H${barChartWidth}`} stroke='black' />
                    {
                        axisPropsFromTickScale(scaleYear, 10).values.map((value, i) => {
                            return (
                                <g
                                    transform={`translate(${scaleYear(value)}, ${0})`}
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
                                    {
                                        (i % 5 === 0) &&
                                        <text
                                            fontSize={14}
                                            x={0}
                                            y={20}
                                        >{formatNumber(value)}</text>
                                    }
                                </g>
                            )
                        })
                    }
                </g>
            </g>
        </svg>
    )
}