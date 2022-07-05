import React, { useEffect, useMemo, useRef, useState } from "react";

import DiagonalHatching from "../../components/DiagonalHatching";

import { extent, range } from 'd3-array';
import { scaleLinear } from "d3-scale";

export default function Timeline({
    data,
    dimensions,
    palette,
    callerProps,
    yearState,
    ...props
}) {
    const { width, height } = dimensions;
    const [cursorX, setCursorX] = useState(undefined);
    const [yearTicks, setYearTicks] = useState(10);
    const [diplayedYear, setDiplayedYear] = yearState;

    const svgRef = useRef(null);

    function getCursorCoordinates(e) {
        const { clientX, clientY } = e;
        const { top, left } = svgRef.current.getBoundingClientRect();
        return {
            x: clientX - left,
            y: clientY - top
        }
    }

    function getYearWithX(xCoordinateOnClick) {
        if (xCoordinateOnClick === undefined) { return; }
        const floatYearForXCoordinate = spanRange.invert(xCoordinateOnClick);
        const yearForXCoordinate = Math.round(floatYearForXCoordinate);
        return yearForXCoordinate;
    }

    const {
        minYear,
        maxYear,
        perYear
    } = useMemo(function rangeYears() {
        const periodsYears = data
            .filter(({ type }) => type === 'period')
            .map(({ year_start, year_end }) => [year_start, year_end])
            .flat();
        const [minYear, maxYear] = extent(periodsYears);

        let perYear = range(minYear, maxYear, 1).map(year => {
            return [
                year, {
                    head: '1700__head.svg',
                    map: '1700__map.svg',
                    legend: '1700__legend.svg'
                }
            ]
        });
        perYear = Object.fromEntries(perYear);

        return {
            minYear,
            maxYear,
            perYear
        };
    }, [data]);

    const spanRange = useMemo(() => {
        return scaleLinear()
            .domain([minYear, maxYear])
            .range([0, width]);
    }, [minYear, maxYear, width]);

    useEffect(function evalTicksFromDisplaySize() {
        if (svgRef === null) { return; }
        const { width: displayWidth } = svgRef.current.getBoundingClientRect();
        const yearnNb = maxYear - minYear;
        if ((displayWidth / yearnNb) < 2) { setYearTicks(20); }
        else { setYearTicks(10); }
    }, [svgRef, width, minYear, maxYear]);

    return (
        <svg
            {...{ width, height }}
            ref={svgRef}
            onClick={(e) => {
                const { x } = getCursorCoordinates(e);
                let yearTarget = getYearWithX(x);
                setDiplayedYear(yearTarget);
            }}
            onMouseMove={(e) => {
                const { x } = getCursorCoordinates(e);
                setCursorX(x)
            }}
            onMouseLeave={() => setCursorX(undefined)}
        >
            <DiagonalHatching id='diag-hatch' lineGap={5} color='red' />
            {
                data.filter(({ type }) => type === 'period').map(({ year_start, year_end, upper_town, lower_town }, i) => {
                    const colorUpperTown = palette[upper_town];
                    const colorLowerTown = palette[lower_town];
                    const lineHeight = (height - 15) / 2;
                    return (
                        <g
                            key={i}
                        >
                            <g>
                                {
                                    upper_town === 'tax-free' &&
                                    <path
                                        d={`
                                        M ${spanRange(year_start)}, ${lineHeight / 2}
                                        H ${spanRange(year_end)}
                                        `}
                                        stroke='#2F2D8D'
                                        strokeWidth={lineHeight}
                                        opacity={0.2}
                                    />
                                }
                                <path
                                    d={`
                                    M ${spanRange(year_start)}, ${lineHeight / 2}
                                    H ${spanRange(year_end)}
                                    `}
                                    stroke={colorUpperTown}
                                    strokeWidth={lineHeight}
                                    opacity={(colorUpperTown === '#2F2D8D' ? 0.2 : 1)}
                                />
                            </g>
                            <g>
                                {
                                    lower_town === 'tax-free' &&
                                    <path
                                        d={`
                                        M ${spanRange(year_start)}, ${lineHeight + lineHeight / 2}
                                        H ${spanRange(year_end)}
                                        `}
                                        stroke='#2F2D8D'
                                        strokeWidth={lineHeight}
                                        opacity={0.2}
                                    />
                                }
                                <path
                                    d={`
                                    M ${spanRange(year_start)}, ${lineHeight + lineHeight / 2}
                                    H ${spanRange(year_end)}
                                    `}
                                    stroke={colorLowerTown}
                                    strokeWidth={lineHeight}
                                    opacity={(colorLowerTown === '#2F2D8D' ? 0.2 : 1)}
                                />
                            </g>
                        </g>
                    )
                })
            }
            {
                data.filter(({ type }) => type === 'event').map(({ year_start, interests }, i) => {
                    const interestsColor = (interests === 'port_interests' ? palette['point-port'] : palette['point-kingdom']);
                    const pointHeight = 12;
                    return (
                        <g
                            transform={`translate(${spanRange(year_start) - pointHeight / 2}, ${8})`}
                            key={i}
                        >
                            <circle
                                cx={pointHeight / 2}
                                cy={pointHeight / 2}
                                r={pointHeight / 2}
                                fill='white'
                                style={{
                                    filter: 'drop-shadow(1px 2px 2px rgb(0 0 0 / 0.4))'
                                }}
                            />
                            <circle
                                cx={pointHeight / 2}
                                cy={pointHeight / 2}
                                r={pointHeight / 4}
                                fill={interestsColor}
                            />
                        </g>
                    )
                })
            }
            {
                range(minYear, maxYear, yearTicks).map((year, i) => {
                    return (
                        <g
                            transform={`translate(${spanRange(year)}, ${0})`}
                            key={i}
                        >
                            <path
                                d={`
                                M 0, 0
                                V ${height}
                                `}
                                stroke='gray'
                                strokeWidth={0.5}
                                strokeDasharray="3,3"
                            />
                            <text y={height} x={2} fontSize={8} fill='gray'>{year}</text>
                        </g>
                    )
                })
            }
            <g
                transform={`translate(${cursorX || spanRange(diplayedYear)}, ${0})`}
            >
                <path
                    d={`
                    M 0, 0
                    V ${height}
                    `}
                    stroke='black'
                    strokeWidth={1.5}
                />
                <rect y={height - 10} x={2} width={20} height={10} fill='white' />
                <text y={height} x={2} fontSize={8} fill='black'>{getYearWithX(cursorX) || diplayedYear}</text>
            </g>
        </svg>
    )
}