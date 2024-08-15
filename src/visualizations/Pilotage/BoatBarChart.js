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
        bottom: 30,
        left: 60
    };
    
    const rightBarSpace = 300;
    const barFromBarChartWidth = useMemo(() => {
      return (dimensions.width - margin.left - rightBarSpace) / data.length - 2;
    }, [data, dimensions.width]) // 4;
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
                            return (
                                <g key={i}>
                                    <path
                                        d={`
                                        M ${0}, ${height - margin.bottom}
                                        V ${totalY}
                                        `}
                                        stroke={colorPalette['total']}
                                        strokeWidth={20}
                                        opacity={i / 100}
                                    />
                                    <path
                                        d={`
                                        M ${0}, ${height - margin.bottom}
                                        V ${pilotageY}
                                        `}
                                        stroke={colorPalette['sorties_pilotage']}
                                        strokeWidth={20}
                                        opacity={i / 100}
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
                    <g>
                        <path
                            className='description-total'
                            d={`
                            M 0,0
                            h 20
                            V ${maxValueScalePilotage}
                            h -20
                            `}
                            stroke={colorPalette['total']}
                            strokeWidth={0.5}
                            fill='transparent'
                        />
                        <text
                            transform={`translate(${10}, ${20}) rotate(-90)`}
                            fontSize={11}
                            textAnchor='end'
                        >hors pilotage</text>
                    </g>
                    <g>
                        <path
                            className='description-pilotage'
                            d={`
                            M 0,${maxValueScalePilotage}
                            h 30
                            V ${height - margin.bottom}
                            h -30
                            `}
                            stroke={colorPalette['sorties_pilotage']}
                            strokeWidth={0.5}
                            fill='transparent'
                        />
                        <text
                            transform={`translate(${10}, ${maxValueScalePilotage + 20}) rotate(-90)`}
                            fontSize={11}
                            textAnchor='end'
                        >pilotage</text>
                    </g>
                    <path
                        className='description-pilotage-queue'
                        d={`
                        M 30,${maxValueScalePilotage + 50}
                        h 10
                        `}
                        stroke={colorPalette['sorties_pilotage']}
                        strokeWidth={0.5}
                        fill='transparent'
                    />
                    <foreignObject
                      y={maxValueScalePilotage}
                      x={45}
                      width={150}
                      height={height / 2}
                      className="max-value-scale-label-container"
                    >
                      <p
                          xmlns="http://www.w3.org/1999/xhtml"
                          style={{ fontSize: 14, }}
                      >
                        {translate('Pilotage', 'description_pilotage', lang, { mean: Math.round(meanPilotage) })}
                      </p>
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
                                        className='path-vertical'
                                        d={`
                                        M ${yearY - (barFromBarChartWidth / 2)}, ${height - margin.bottom}
                                        V ${totalY}
                                        `}
                                        stroke={colorPalette['total']}
                                        strokeWidth={barFromBarChartWidth}
                                    />
                                    <path
                                        className='path-horizontal'
                                        d={`
                                        M ${yearY - (barFromBarChartWidth)}, ${totalY}
                                        H ${barChartWidth - (barFromBarChartWidth / 2) + 50}
                                        `}
                                        stroke={colorPalette['total']}
                                        strokeWidth={0.5}
                                        strokeDasharray='4'
                                    />

                                    <path
                                        className='path-vertical'
                                        d={`
                                        M ${yearY - (barFromBarChartWidth / 2)}, ${height - margin.bottom}
                                        V ${pilotageY}
                                        `}
                                        stroke={colorPalette['sorties_pilotage']}
                                        strokeWidth={barFromBarChartWidth}
                                    />
                                    <path
                                        className='path-horizontal'
                                        d={`
                                        M ${yearY - (barFromBarChartWidth)}, ${pilotageY}
                                        H ${barChartWidth - (barFromBarChartWidth / 2) + 50}
                                        `}
                                        stroke={colorPalette['sorties_pilotage']}
                                        strokeWidth={0.5}
                                        strokeDasharray='4'
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
                                            x={-2}
                                            y={3}
                                            textAnchor='end'
                                        >{formatNumber(value, lang)}</text>
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
                    {
                        axisPropsFromTickScale(scaleYear, 5).values.map((value, i) => {
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
                                        (value % 5 === 0) &&
                                        <text
                                            transform='translate(0, 20) rotate(-45)'
                                            fontSize={11}
                                            x={0}
                                            // y={20}
                                            textAnchor="middle"
                                        >{value}</text>
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