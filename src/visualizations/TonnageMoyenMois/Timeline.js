import React, { useEffect, useMemo, useRef, useState } from 'react';
import { extent, range } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import colorsPalettes from '../../utils/colorPalettes';
import { useSpring, animated } from 'react-spring';
import translate from '../../utils/translate';


/**
 * 
 * @param {Object} props 
 * @param {Object} props.dimensions 
 * @param {Number} props.dimensions.width 
 * @param {Number} props.dimensions.height
 * @returns 
 */

 export function Rect({
  className,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
      <animated.rect className={className}  {...animatedProps} />
  )
}

export default function Timeline({
    dimensions,
    years,
    yearBrushState,
    margins = {
      left: 0,
      right: 0
    },
    lang,
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
            .range([margins.left, width - margins.right])
            // .range([0, width])
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

    const fragmentWidth = useMemo(() => yearRange(years[1]) - yearRange(years[0]), [years, yearRange]);

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
        <>
        <p className="brush-prompt" style={{
          marginLeft: margins.left,
          marginRight: margins.right,
        }}>
          {translate('TonnageMoyenMois', 'brush_prompt', lang)}
        </p>
        <svg
          className="Timeline"
            {...{
                width,
                height
            }}
            ref={timelineRef}
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
                    setBrushEnd(convertXOnYear(xRelative));
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
                range(+minYear, +maxYear, 1).map((year) => {
                    year = year.toString();
                    const isIndexedYear = years.includes(year);
                    const isCurrentVizYear = currentVizYearBrush.includes(year);
                    const isCurrentVizYearMinusOne = currentVizYearBrush.includes('' + (+year - 1));
                    const graphHeight = height - 60;
                    const BAR_HEIGHT = isCurrentVizYear ? graphHeight * .7 : graphHeight / 4;
                    return (
                        <g
                            transform={`translate(${yearRange(year)}, ${0})`}
                            onClick={isIndexedYear ? () => setCurrentVizYearBrush([year]) : null}
                            key={year}
                        >
                            {isIndexedYear && year < maxYear &&
                                <Rect
                                    x={0}
                                    y={(graphHeight - BAR_HEIGHT / 2)}
                                    width={fragmentWidth}
                                    height={BAR_HEIGHT}
                                    fill={isCurrentVizYear ? colorAccentBackground : 'rgba(0,0,0,0.1)'}
                                    strokeWidth={0}
                                />
                            }
                            <line x={0} y1={0} y2={40} stroke={isCurrentVizYear ||isCurrentVizYearMinusOne ? 'black' : 'lightgrey'} />
                            <text fill={isCurrentVizYear ? 'black' : 'lightgrey'} className="tick-year" x={fragmentWidth / 2} textAnchor="middle" y={height / 2 + 2}>{year}</text>
                        </g>
                    )
                })
            }
            <rect
              x={mouseStart}
              width={mouseEnd - mouseStart}
              y={0}
              height={height}
              fill={colorAccent}
              fillOpacity={.3}
            />
        </svg>
        </>
    )
}