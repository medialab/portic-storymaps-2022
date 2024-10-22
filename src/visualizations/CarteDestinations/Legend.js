
import { useState, useEffect, useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import SliderRange from '../../components/SliderRange';

import palettes from '../../utils/colorPalettes';
import translate from '../../utils/translate';
import { formatNumber } from '../../utils/misc';
import { debounce } from 'lodash';

const { generic20colors, dunkerqueColor } = palettes;

const DebouncedSlider = ({
  min,
  max,
  value,
  onChange,
}) => {
  const [localMin, setLocalMin] = useState(min);
  useEffect(() => {
    setLocalMin(min)
  }, [min]);
  const [localMax, setLocalMax] = useState(max);
  useEffect(() => {
    setLocalMax(max)
  }, [min]);
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => {
    setLocalValue(value)
  }, [value]);
  const onChangeDebounced = useMemo(() => 
  debounce((newValue) => onChange(newValue), 1000)
  , [])

  const handleChange = newValue => {
    setLocalValue(newValue);
    onChangeDebounced(newValue);
  }
  return (
    <SliderRange
      min={localMin}
      max={localMax}
      value={localValue}
      onChange={handleChange}
    />
  )
}

const Legend = ({
  flagGroupModalities,
  flagGroupFilters,
  setFlagGroupFilters,
  filterOptions,
  groupStrangers,
  setGroupStrangers,

  showOffscreenPorts,
  showDetailsInMap,
  setShowOffscreenPorts,
  setShowDetailsInMap,

  dominantMode,

  longCoursOnly,
  setLongCoursOnly,
  maxPossibleTonnage,
  minTonnage,
  maxTonnage,

  maxDestinationTonnage,
  minDestinationTonnage,
  maxCircleArea,

  setMinTonnage,
  setMaxTonnage,
  containerWidth,
  containerHeight,
  lang,
  atlasMode,
}) => {
  const [legendIsEdited, setLegendIsEdited] = useState(false);
  const svgDimension = containerWidth / 8;
  const margin = 10;
  const radius = (svgDimension - margin * 2) / 2;

  const areaScale = scaleLinear().domain([0, maxDestinationTonnage]).range([0, maxCircleArea]);
  const sizeRadiusScale = tonnage => {
    const area = areaScale(tonnage);
    return Math.sqrt((area / Math.PI));
  }
  
  // const minSizeRadius = sizeRadiusScale(minDestinationTonnage);
  const minSizeRadius = sizeRadiusScale(maxDestinationTonnage / 10);
  const maxSizeRadius = sizeRadiusScale(maxDestinationTonnage);
  // const randomRadiuses = useMemo(() => flagGroupModalities.map(() => Math.random() * radius / 2 + radius / 3), [flagGroupModalities, radius] ) 
  // const randomRadiuses = useMemo(() => flagGroupModalities.map(() => Math.random() * radius / 2 + radius / 3), [flagGroupModalities, radius] ) 
  return (
    <div className={`Legend ${legendIsEdited ? 'has-legend-edited' : ''}`}>
      <div className="left-column">
        <h3>
          <span>
            {
              translate('CarteDestinations', 'legend_title', lang)
            }
          </span>
          {atlasMode ? 
          <button onClick={() => setLegendIsEdited(!legendIsEdited)}>{!legendIsEdited ? translate('CarteDestinations', 'edit_legend', lang) : translate('CarteDestinations', 'unedit_legend', lang)}</button>
          : null}
        </h3>
        <div className="object-explanation-container">
          <div className={`object-svg-container ${dominantMode ? 'is-hidden' : ''}`}>
            <svg
              width={svgDimension}
              height={svgDimension}
              className="legend-object"
            >

              <g transform={`translate(${svgDimension / 2}, ${svgDimension / 2})`}>
                <circle
                  cx={0}
                  cy={0}
                  r={radius}
                  className={'background-circle'}
                />
                {
                  flagGroupModalities
                  .map((modality, i) => {
                    const isIncluded = flagGroupFilters.length ? flagGroupFilters.includes(modality) : true
                    const deg = (i / flagGroupModalities.length) * 360 - 90;
                    const theta = deg * Math.PI / 180;
                    // const x2 = (randomRadiuses[i]) * Math.cos(theta);
                    // const y2 = (randomRadiuses[i]) * Math.sin(theta);

                    const x2 = radius * .5 * Math.cos(theta);
                    const y2 = radius * .5 * Math.sin(theta);

                    const nextI = i < flagGroupModalities.length - 1 ? i + 1 : 0;
                    const nextDeg = (nextI / flagGroupModalities.length) * 360 - 90;
                    const nextTheta = nextDeg * Math.PI / 180;

                    // const nextX = (randomRadiuses[nextI]) * Math.cos(nextTheta);
                    // const nextY = (randomRadiuses[nextI]) * Math.sin(nextTheta);

                    const nextX = radius * .5 * Math.cos(nextTheta);
                    const nextY = radius * .5 * Math.sin(nextTheta);
                    const midX = 0;
                    const midY = 0;
                    const triangleD = `M ${x2} ${y2} L ${nextX} ${nextY} L ${midX} ${midY} Z`;
                    const colorVar = 30 + parseInt(i / flagGroupModalities.length * 30);

                    return (
                      <g key={i} className={`radar-element radar-element-background ${isIncluded ? 'is-visible' : 'is-hidden'}`}>
                        <path
                          d={triangleD}
                          className="radar-triangle"
                          stroke="none"
                          fill={`hsl(192,42%, ${colorVar}%)`}
                          fillOpacity={.8}
                        />
                      </g>
                    )
                  })
                }
                {
                  flagGroupModalities.map((modality, i) => {
                    const isIncluded = flagGroupFilters.length ? flagGroupFilters.includes(modality) : true
                    const deg = (i / flagGroupModalities.length) * 360 - 90;
                    const theta = deg * Math.PI / 180;
                    const x2 = radius * Math.cos(theta);
                    const y2 = radius * Math.sin(theta);
                    return (
                      <g key={modality} className={`radar-element ${isIncluded ? 'is-visible' : 'is-hidden'}`}>
                        <line
                          key={modality + 'L'}
                          x1={0}
                          y1={0}
                          x2={x2}
                          y2={y2}
                          className="radar-line"
                        />
                        <circle
                          className="number-background"
                          key={modality + 'A'}
                          cx={x2}
                          cy={y2}
                          r={8}
                          fill={generic20colors[i]}
                        />
                        <text
                          className="number-number"
                          key={modality + 'B'}
                          x={x2}
                          y={y2 + 4}
                          fontSize={10}
                        >
                          {i + 1}
                        </text>
                      </g>
                    )
                  })
                }
              </g>
            </svg>
          </div>

          <div className="flags-container">
            <h5>
              {
                dominantMode ?
                  translate('CarteDestinations', 'legend_dominant_title', lang)
                  :
                  translate('CarteDestinations', 'legend_flags_title', lang)
              }
            </h5>
            <div className="variables-explanations-container">
              <ol className="flag-group-modalities-list" style={{ maxHeight: containerHeight / 3 }}>
                {
                  flagGroupModalities
                    .map((id, modalityIndex) => {
                      const isIncluded = flagGroupFilters.length ? flagGroupFilters.includes(id) : true
                      const handleClick = (e) => {
                        e.stopPropagation();
                        if (!flagGroupFilters.length) {
                          setFlagGroupFilters(flagGroupModalities.filter(f => f !== id).join(','));
                          // remove
                        } else if (isIncluded) {
                          setFlagGroupFilters(flagGroupFilters.split(',').filter(i => i !== id).join(','));
                          // add
                        } else {
                          setFlagGroupFilters(`${flagGroupFilters},${id}`);
                        }
                      }
                      const color = ['dunkerque', 'dunkirk'].includes(id) ? dunkerqueColor : generic20colors[modalityIndex];
                      return (
                        <li key={id} className={`flag-group-modality-item ${isIncluded ? 'is-visible' : 'is-hidden'}`}>
                          <span className="number" style={{
                            background: color,
                            color: dominantMode ? color : undefined,
                          }}>
                            <span>
                              {modalityIndex + 1}
                            </span>
                          </span>
                          {/* <input onClick={handleClick} type="checkbox" checked={isIncluded} readOnly /> */}
                          <label>{id}</label>
                          {
                            legendIsEdited ?
                              <button onClick={handleClick}>{isIncluded ? translate('CarteDestinations', 'hide', lang) : translate('CarteDestinations', 'show', lang)}</button>
                              : null
                          }
                        </li>
                      )
                    })
                }
              </ol>
              <div className={`scale-indication-container ${dominantMode ? '' : 'is-hidden'}`}>
                <svg 
                  className="scale-indication"
                  width={svgDimension}
                  height={maxSizeRadius * 2 + 10}
                >
                  <circle
                    cx={maxSizeRadius + 5}
                    cy={maxSizeRadius + 5}
                    r={maxSizeRadius}
                    fill="transparent"
                    stroke="grey"
                    strokeDasharray={'2 2'}
                  />
                  <line
                    y1={5}
                    y2={5}
                    x1={maxSizeRadius + 5}
                    x2={svgDimension - 40}
                    stroke="grey"
                    strokeDasharray={'2 2'}
                  />
                  <text
                    textAnchor="end"
                    // x={maxSizeRadius * 5 - 10}
                    x={svgDimension}
                    y={8}
                    fontSize={8}
                  >
                    {formatNumber(maxDestinationTonnage, lang)} {lang === 'fr' ? 'tx' : 'tx'}.
                  </text>
                  {/* small mark */}
                  <circle
                    cx={5 + maxSizeRadius}
                    cy={maxSizeRadius * 2 - minSizeRadius / 2 + 1}
                    r={minSizeRadius}
                    fill="transparent"
                    stroke="grey"
                    strokeDasharray={'2 2'}
                  />
                  <line
                    y1={maxSizeRadius * 2 - minSizeRadius - 4 + 1}
                    y2={maxSizeRadius * 2 - minSizeRadius - 4 + 1}
                    x1={maxSizeRadius + 5}
                    x2={svgDimension - 40}
                    strokeDasharray={'2 2'}
                    stroke="grey"
                  />
                  <text
                    textAnchor="end"
                    x={svgDimension}
                    // x={maxSizeRadius * 5 - 10}
                    y={maxSizeRadius * 2 - minSizeRadius + 1}
                    fontSize={8}
                  >
                    {formatNumber(maxDestinationTonnage / 10, lang)} {lang === 'fr' ? 'tx' : 'tx'}.
                  </text>
                </svg>
              </div>
            </div>
            {
              dominantMode ?
                <p style={{ fontSize: 10, maxWidth: '15rem' }}>
                  <i>
                    {translate('CarteDestinations', 'legend_saturation', lang)}
                  </i>
                </p>
                :
                null
            }
          </div>
        </div>
      </div>
      <div
        className="right-column"
        style={{
          maxWidth: legendIsEdited ? containerWidth / 3 : 0,
          width: legendIsEdited ? containerWidth / 3 : 0,
        }}
      >
        <div className="right-column-contents">
          <div>
            {/* <h4>{translate('CarteDestinations', 'legend_options_title', lang)}</h4> */}
            <ul className="options-list">
              {
                filterOptions.map(({ id, labels }) => {
                  let checked = false;
                  switch (id) {
                    case 'show_offscreen_ports':
                      checked = showOffscreenPorts;
                      break;
                    case 'show_details_in_map':
                      checked = showDetailsInMap;
                      break;
                    case 'group_strangers':
                      checked = groupStrangers;
                      break;
                    case 'only_long_cours':
                    default:
                      checked = longCoursOnly;
                      break;
                  }
                  const handleClick = (e) => {
                    e.stopPropagation();
                    switch (id) {
                      case 'show_offscreen_ports':
                        setShowOffscreenPorts(!showOffscreenPorts);
                        break;
                      case 'show_details_in_map':
                        setShowDetailsInMap(!showDetailsInMap);
                        break;
                      case 'group_strangers':
                        setGroupStrangers(!groupStrangers);
                        setFlagGroupFilters('');
                        break;
                      case 'only_long_cours':
                      default:
                        setLongCoursOnly(!longCoursOnly)
                        break;
                    }
                  }
                  return (
                    <li key={id}>
                      <input onClick={handleClick} type="checkbox" checked={checked} readOnly />
                      <span onClick={handleClick} className={`checkbox ${checked ? 'is-checked' : ''}`} readOnly />
                      <label>{translate('CarteDestinations', 'legend_' + id, lang)}</label>
                    </li>
                  )
                })
              }
            </ul>
          </div>
          <div>
            <h4>{translate('CarteDestinations', 'legend_show_tonnages', lang, {
              min: +minTonnage,
              max: +maxTonnage
            })}</h4>
            <div className="slider-container" onMouseUp={e => e.stopPropagation()}>
              <DebouncedSlider
                min={0}
                max={+maxPossibleTonnage}
                value={[+minTonnage, +maxTonnage]}
                onChange={([newMin, newMax]) => {
                  setMinTonnage(+newMin);
                  setMaxTonnage(+newMax);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Legend;