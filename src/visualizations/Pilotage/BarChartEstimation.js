import React, { useMemo, useEffect } from 'react';

import Tooltip from 'react-tooltip';
import { extent, max, min, mean } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisPropsFromTickScale } from 'react-d3-axis';
import translate from '../../utils/translate';
import { formatNumber } from '../../utils/misc';

import DiagonalHatching from '../../components/DiagonalHatching';
import ArrowNote from "../../components/ArrowNote";

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

  const footerHeight = useMemo(() => height / 5, [height]);
  const barFromBarChartWidth = useMemo(() => {
    let normal = (dimensions.width - margin.left - margin.right) / data.length - 3;
    return normal >= 1 ? normal : 1;
  }, [data, dimensions.width]);// 8;

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
    maxProjectionPerYear
  } = projectionStats;

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
      .range([height - margin.bottom, margin.bottom]).nice();
  }, [data, maxPilotage, height]);

  useEffect(() => {
    Tooltip.rebuild();
  });

  return (
    <>
      <svg
        {...{ width, height }}
      >
        <DiagonalHatching id='diag-hatch' lineGap={4} strokeWidth={5} color={colorPalette['total']} />
        <marker id='arrow-note-head' orient='auto' markerWidth='10' markerHeight='6' refX='0.1' refY='2'>
          <path d='M0,0 V4 L2,2 Z' fill='black' />
        </marker>

        <g className='bars'>
          {
            data.map(({ year, sorties_pilotage, total }, i) => {
              if (sorties_pilotage == undefined && total == undefined) {
                return null;
              }

              const totalY = scaleTotal(total);
              const pilotageY = scaleTotal(sorties_pilotage);
              // const pilotageMaxY = scaleTotal(sorties_pilotage / maxPilotage);
              // const pilotageMinY = scaleTotal(sorties_pilotage / minPilotage);
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
                    data-tip={translate('Pilotage', 'tooltip_total', lang, { value: formatNumber(total, lang), year })}
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
                          value_min: formatNumber(Math.round(sorties_pilotage / maxPilotage), lang),
                          value_max: formatNumber(Math.round(sorties_pilotage / minPilotage), lang),
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
                      <g
                        className='moustach'
                      >
                        {
                          projectionPerYear.map(({ realityGapPourcentage, proportion }, projectionIndex) => {
                            // console.log(sorties_pilotage, realityGapPourcentage)
                            const estimateAbs = (sorties_pilotage * 100) / proportion // 
                            // console.log({sorties_pilotage, realityGapPourcentage, estimateAbs})
                            // const estimateAbs = sorties_pilotage / meanPilotage + (realityGapPourcentage / 100) * (sorties_pilotage / meanPilotage);

                            return (
                              <path
                                d={
                                  `
                                    M ${0}, ${pilotageMeanY}
                                    V ${scaleTotal(estimateAbs)}
                                  `}
                                stroke='black'
                                strokeWidth={3}
                                opacity={0.1}
                                strokeLinecap='round'
                                key={projectionIndex}
                              />
                            )
                          })
                        }
                        <circle cx={0} cy={pilotageMeanY} r={4} fill='black' />
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
                    x={-2}
                    y={3}
                    textAnchor='end'
                  >{formatNumber(value, lang)}</text>
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
            data
            .filter(({year}) => year % 2 === 0)
            .map(({ year }, i) => {
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
                    x={-2}
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
            [...axisPropsFromTickScale(scaleTotal, 3).values].map((value, i) => {
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
              x={scaleYear(startYear)}
              width={scaleYear(startYearForProjection) - scaleYear(startYear)}
              height={footerHeight}
              className="projection-label-container"
            >
              <div className="back-label">
                <p
                  xmlns="http://www.w3.org/1999/xhtml"
                >{translate('Pilotage', 'footer_projection', lang, { year_start: startYearForProjection, year_end: endYearForProjection })}</p>
              </div>
            </foreignObject>
          </g>
          <g className='footer-register'>
            <path
              d={`M${scaleYear(startYearForProjection) + 5},${-15} H${scaleYear(endYearForProjection)}`}
              stroke='black'
            />
            <foreignObject
              y={-25}
              x={scaleYear(startYearForProjection)}
              width={scaleYear(endYearForProjection) - scaleYear(startYearForProjection)}
              height={footerHeight}
              className="register-label-container"
            >
              <div
                className="back-label is-black">
                <p
                  xmlns="http://www.w3.org/1999/xhtml"
                >{translate('Pilotage', 'footer_register', lang)}</p>
              </div>
            </foreignObject>
          </g>
        </g>
        <g className='notes'>
          <ArrowNote
            arrowId='arrow-note-head'
            textWidth={scaleYear(1736) - scaleYear(1733)}
            textHeight={scaleTotal(1100)}
            x1={scaleYear(1733)}
            x2={scaleYear(1731.6)}
            y1={scaleTotal(1000)}
            y2={scaleTotal(50)}
            text={translate('Pilotage', 'note_demonstration_pilotage', lang)}
            arrowPosition={'center left'}
          />
          <ArrowNote
            arrowId='arrow-note-head'
            textWidth={scaleYear(1736) - scaleYear(1732)}
            textHeight={80}
            x1={scaleYear(1734)}
            x2={scaleYear(1731.5)}
            y1={scaleTotal(2600)}
            y2={scaleTotal(900)}
            textAlign='left'
            text={translate('Pilotage', 'note_demonstration_projection', lang)}
            arrowPosition={'bottom left'}
          />
          <ArrowNote
            arrowId='arrow-note-head'
            textWidth={100}
            textHeight={80}
            x1={scaleYear(1755)}
            y1={scaleTotal(2950)}
            x2={scaleYear(1752.5)}
            y2={scaleTotal(1900)}
            text={translate('Pilotage', 'note_demonstration_margin', lang)}
            arrowPosition={'bottom left'}
          />
        </g>
      </svg>
      <Tooltip id="bar-tooltip" />
    </>
  )
}