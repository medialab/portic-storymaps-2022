import React, { useEffect, useMemo, useRef, useState } from "react";
import { G, Line } from '../../components/animatedPrimitives'

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
  const [isTransitionning, setIsTransitionning] = useState(false);
  const [displayedYear, setDisplayedYear] = yearState;

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
      .range([10, width - 15]);
  }, [minYear, maxYear, width]);

  useEffect(function evalTicksFromDisplaySize() {
    if (svgRef === null) { return; }
    const { width: displayWidth } = svgRef.current.getBoundingClientRect();
    const yearnNb = maxYear - minYear;
    if ((displayWidth / yearnNb) < 2) { setYearTicks(20); }
    else { setYearTicks(10); }
  }, [svgRef, width, minYear, maxYear]);

  useEffect(() => {
    if (!isTransitionning) {
      setIsTransitionning(true);
      setTimeout(() => {
          setIsTransitionning(false);
      }, 500)
    }
    
  }, [displayedYear])

  const FONT_SIZE = 8;
  const TICK_MARGIN = 5;

  return (
    <svg
      {...{ width, height }}
      ref={svgRef}
      onClick={(e) => {
        const { x } = getCursorCoordinates(e);
        let yearTarget = getYearWithX(x);
        setDisplayedYear(yearTarget);
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
          const lineHeight = (height - FONT_SIZE - TICK_MARGIN) / 2; // 15;
          return (
            <g
              key={i}
              className="period"
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
      {/* displayed year marker */}
      <G
        transform={`translate(${spanRange(displayedYear)}, ${0})`}
      >
        <Line
          x1={0}
          y1={0}
          x2={0}
          y2={height - 13}
          stroke='black'
          strokeWidth={isTransitionning ? 5 : 1}
          className="position-line"
        />
        {/* <path
          fill="black"
          d={`M -3,0 L 3,0 L 0,5 Z`}
        /> */}
        {/* <g transform={`translate(0, ${height - 13})`}>
          <path
            fill="black"
            d={`M -3,0 L 3,0 L 0,-5 Z`}
          />
        </g> */}
        {/* <rect y={height - 10} x={2} width={20} height={10} fill='white' /> */}
        {/* <text y={height} x={2} fontSize={8} x={2} fill='black'>{displayedYear}</text> */}
      </G>
      {
        data.filter(({ type }) => type === 'event')
          .map(({ year_start, interests, head }, i) => {
            const interestsColor = (interests === 'port_interests' ? palette['point-port'] : palette['point-kingdom']);
            const pointHeight = 12;
            return (
              <g
                transform={`translate(${spanRange(year_start) - pointHeight / 2}, ${(height - FONT_SIZE * 2 - TICK_MARGIN) / 2})`}
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
                <circle
                  cx={pointHeight / 2}
                  cy={pointHeight / 2}
                  r={pointHeight}
                  fill='transparent'
                  stroke="none"
                  data-for="histoire-dunkerque-tooltip"
                  data-tip={head}
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
              <text y={height} x={2} fontSize={FONT_SIZE} fill='gray'>{year}</text>
            </g>
          )
        })
      }

      <g
        transform={`translate(${cursorX}, ${0})`}
        style={{ opacity: cursorX === undefined ? 0 : 1, pointerEvents: 'none' }}
      >
        {/* <path
          fill="grey"
          d={`M -3,0 L 3,0 L 0,5 Z`}
        /> */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={height}
          stroke='grey'
          strokeWidth={1.5}
          className="cursor-line"
        />
        <rect y={height - 10} x={2} width={20} height={10} fill='white' />
        <text y={height} x={2} fontSize={8} x={2} fill='black'>{getYearWithX(cursorX) || displayedYear}</text>
      </g>
    </svg>
  )
}