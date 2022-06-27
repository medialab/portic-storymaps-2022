import React, { useEffect, useMemo, useRef, useState } from 'react';
import { extent, range } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import colorsPalettes from '../../utils/colorPalettes';

/**
 * 
 * @param {Object} props 
 * @param {Object} props.dimensions 
 * @param {Number} props.dimensions.width 
 * @param {Number} props.dimensions.height
 * @returns 
 */

export default function Timeline({
    dimensions,
    years,
    yearBrushState,
    ...props
}) {
    const { width, height } = dimensions;
    const [currentVizYearBrush, setCurrentVizYearBrush] = yearBrushState;

    const [isOnBrush, setIsOnBrush] = useState(false);
    const [brushStart, setBrushStart] = useState(0);
    const [brushEnd, setBrushEnd] = useState(0);
    const [mouseStart, setMouseStart] = useState(0);
    const [mouseEnd, setMouseEnd] = useState(0);
    const [isMouseCapture, setIsMouseCapture] = useState(false);

    const timelineRef = useRef(null);

    const [minYear, maxYear] = extent(years);

    const yearRange = useMemo(() => {
        return scaleLinear()
            .domain([minYear, maxYear])
            .range([0, width])
    }, [years, width]);

    useEffect(function handleMouseClickAndMove (e) {
        if (!!timelineRef === false && isOnBrush === false) {
            return;
        }
    }, [timelineRef, isOnBrush]);

    useEffect(function setCurrentVizYearWhenBrushChange () {
        if ([brushStart, brushEnd].every(brush => brush === 0)) { return; }
        if (brushStart === brushEnd) {
            setCurrentVizYearBrush([brushStart.toString()]);
            return;
        }
        const [minBrush, maxBrush] = extent([brushStart, brushEnd]);
        let yearsBetweenStartnEndBrush;
        yearsBetweenStartnEndBrush = range(minBrush, maxBrush, 1);
        yearsBetweenStartnEndBrush = yearsBetweenStartnEndBrush
            .map(year => year.toString())
            .filter(year => years.includes(year));
        setCurrentVizYearBrush(yearsBetweenStartnEndBrush);
    }, [brushStart, brushEnd]);

    const fragmentHeight = useMemo(() => yearRange(years[1]), [years, yearRange]);

    const { colorAccentBackground, colorAccent } = colorsPalettes.ui;

    function mouseXToTimlineX(e) {
        const { pageX } = e;
        const { left } = timelineRef.current.getBoundingClientRect();
        const xRelative = pageX - left;
        return xRelative;
    }

    function convertXOnYear(xRelative) {
        const year = yearRange.invert(xRelative);
        return Math.round(year)
    }

    return (
        <svg
            {...{
                width,
                height
            }}
            ref={timelineRef}
            style={{
                cursor:'crosshair',
                userSelect:'none'
            }}
            onMouseDown={(e) => {
                const xRelative = mouseXToTimlineX(e);
                setIsMouseCapture(true);
                setBrushStart(convertXOnYear(xRelative));
                setMouseStart(xRelative);
            }}
            onMouseMove={(e) => {
                if (isMouseCapture) {
                    const xRelative = mouseXToTimlineX(e);
                    setMouseEnd(xRelative);
                }
            }}
            onMouseUp={(e) => {
                setIsMouseCapture(false);
                const xRelative = mouseXToTimlineX(e);
                setBrushEnd(convertXOnYear(xRelative));
                setMouseEnd(xRelative);
            }}
        >
            {
                range(minYear, maxYear, 1).map(year => {
                    year = year.toString();
                    const isIndexedYear = years.includes(year);
                    const isCurrentVizYear = currentVizYearBrush.includes(year);
                    return (
                        <g
                            transform={`translate(${yearRange(year)}, ${10})`}
                            onClick={isIndexedYear ? () => setCurrentVizYearBrush([year]) : null}
                        >
                            {isIndexedYear &&
                                <rect
                                    x={0}
                                    y={0}
                                    width={fragmentHeight}
                                    height={20}
                                    fill={isCurrentVizYear ? colorAccentBackground : 'black'}
                                    strokeWidth={0}
                                />
                            }
                            <line x={0} y1={0} y2={40} stroke='black' />
                            <text color='black' y={60} x={-5}>{year}</text>
                        </g>
                    )
                })
            }
            <path
                d={`
                M ${mouseStart}, ${40}
                H ${mouseEnd}
                `}
                strokeWidth={5}
                stroke={colorAccent}
                fill='transparent'
            />
        </svg>
    )
}