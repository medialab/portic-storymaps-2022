import {useMemo} from 'react';
import { useSpring, animated } from "react-spring";
import {scaleLinear} from 'd3-scale';

import { formatNumber } from '../../utils/misc';
import palettes from '../../utils/colorPalettes';
import translate from '../../utils/translate';
import { axisPropsFromTickScale } from 'react-d3-axis';
import { partialCirclePathD } from '../../utils/misc';
import CarteDestinations from '.';

const {generic20colors, dunkerqueColor} = palettes;

const G = ({ children, className, onClick, ...inputProps }) => {
  const props = useSpring(inputProps);
  return (
    <animated.g className={className} onClick={onClick} {...props}>
      {children}
    </animated.g>
  )
}
const Circle = ({ children, className, onClick, style, ...inputProps }) => {
  const props = useSpring(inputProps);
  return (
    <animated.circle className={className} onClick={onClick} style={style} {...props}>
      {children}
    </animated.circle>
  )
}

const Text = ({ children, className, onClick, textAnchor, ...inputProps }) => {
  const props = useSpring(inputProps);
  return (
    <animated.text className={className} onClick={onClick} textAnchor={textAnchor} {...props}>
      {children}
    </animated.text>
  )
}

const Line = ({ children, className, onClick, ...inputProps }) => {
  const props = useSpring(inputProps);
  return (
    <animated.line className={className} onClick={onClick} {...props}>
      {children}
    </animated.line>
  )
}

const Path = ({ children, className, onClick, ...inputProps }) => {
  const props = useSpring(inputProps);
  return (
    <animated.path className={className} onClick={onClick} {...props}>
      {children}
    </animated.path>
  )
}



const Destination = ({
  destination, 
  destination_en,
  // travels, 
  // tonnage, 
  flagGroups, 
  x,
  y,
  radius,
  fontSize,
  overflowing,
  arrowDirection,
  flagGroupModalities,
  dominantMode,


  highlighted,
  onClick,

  lang,
}) => {
  const groupModalityToColor = flagGroupModalities.reduce((obj, modality, index) => ({
    ...obj,
    [modality]: generic20colors[index]
  }), {});
  if (groupModalityToColor['dunkerque']) {
    groupModalityToColor['dunkerque'] = dunkerqueColor;
  } else if (groupModalityToColor['dunkirk']) {
    groupModalityToColor['dunkirk'] = dunkerqueColor;
  } 
  
  const sumTonnage = Object.values(flagGroups).reduce((sum, g) => sum + g.tonnage, 0);
  // const maxTonnage = max(Object.values(flagGroups).map(g => g.tonnage));
  const {maxTonnage, dominantFlag,dominantIndex } = Object.entries(flagGroups)
  .reduce(({dominantFlag, maxTonnage}, [thatFlag, {tonnage: thatTonnage}], modalityIndex) => {
    if (thatTonnage > maxTonnage) {
      return {
        dominantFlag: thatFlag,
        maxTonnage: thatTonnage,
        dominantIndex: modalityIndex,
      }
    }
    return {dominantFlag, maxTonnage}
  }, {dominantFlag: undefined, maxTonnage: -Infinity, dominantIndex: undefined});
  // console.log(destination, ' : dominant flag', dominantFlag, dominantIndex);
  const dominantColor = groupModalityToColor[dominantFlag] // generic20colors[dominantIndex];
  
  const {points, ticks, radarScale, d} = useMemo(() => {
    // const radarScale = scaleLinear().domain([0, maxTonnage]).range([0, radius]);
    const radarScale = scaleLinear().domain([0, sumTonnage]).range([0, radius]).nice();
    const {values: ticks} = axisPropsFromTickScale(radarScale);

    const newPoints = flagGroupModalities.reduce((res, modality, modalityIndex) => {
      const thatTonnage = flagGroups[modality] ? flagGroups[modality].tonnage : 0;
      const thatR = radarScale(thatTonnage);
      const deg = (modalityIndex / flagGroupModalities.length) * 360 - 90;
      const theta = deg  * Math.PI / 180;
      const thatX = thatR * Math.cos(theta);
      const thatY = thatR * Math.sin(theta);
      return [...res, [thatX, thatY, true]];
    }, []);
    const newD = newPoints.reduce((tempD, [thatX, thatY], modalityIndex) => {
      const action = modalityIndex === 0 ? 'M' : 'L';
      return `${tempD} ${action} ${thatX} ${thatY}${modalityIndex !== flagGroupModalities.length - 1 ? ' ' : ' Z'}`
    }, '');
    return {
      points: newPoints,
      radarScale,
      d: newD,
      ticks
    }
  }, [sumTonnage, flagGroupModalities, flagGroups, radius]); 

  const arrowRotate = useMemo(() => {
    if (overflowing) {
      switch(arrowDirection) {
        case 'top':
          return -90;
        case 'bottom':
          return 90;
        case 'left':
          return 180;
        case 'right':
          return 0;
        case 'topleft':
          return -135;
        case 'topright':
          return -45;
        case 'bottomleft':
          return 135;
        case 'bottomright':
        default:
          return 45;
      }
    }
    return 0;
  }, [overflowing, arrowDirection]);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className={`destination ${highlighted ? 'is-highlighted' : ''}`}
      onClick={onClick}
    >
      <circle
        cx={0}
        cy={0}
        r={radius}
        className={'background-circle'}
        data-for="destinations-tooltip"
        data-tip={
          translate("CarteDestinations", 'tooltip', lang, {
            destination,
            tonnage: formatNumber(sumTonnage, lang),
            dominantFlag,
            pct: parseInt(maxTonnage / sumTonnage * 100)
          })
          // `${destination} - ${formatNumber(sumTonnage, lang)} tx - pavillon dominant : ${dominantFlag} à ${parseInt(maxTonnage / sumTonnage * 100)}%`
        }
        style={{
          fill: dominantMode ? dominantColor : undefined,
          filter: dominantMode ? `saturate(${parseInt(maxTonnage / sumTonnage * 100)}%)`: undefined,
          opacity: dominantMode ? '.8' : undefined,
          stroke: dominantMode ? 'transparent': undefined
        }}
      />
      {
        dominantMode ? null :
        flagGroupModalities.map((modality, i) => {
          const deg = (i / flagGroupModalities.length) * 360 - 90;
          const theta = deg  * Math.PI / 180;
          const x2 = radius * Math.cos(theta);
          const y2 = radius * Math.sin(theta);
          return (
            <line
              x1={0}
              y1={0}
              x2={x2}
              y2={y2}
              className="radar-line"
              key={modality}
            />
          )
        })
      }
      {
        highlighted ?
        <g className="ticks-container">
          {
            ticks.slice(0, ticks.length - 1)
            .map((tickValue) => {
              const startDeg = -90;
              const endDeg = -90 + 360 * ((flagGroupModalities.length - 1) / (flagGroupModalities.length));
              const startRad = startDeg * (Math.PI / 180);
              const endRad = endDeg * (Math.PI / 180);
              return (
                <g className="radar-tick" key={tickValue}>
                  {/* <circle
                    cx={0}
                    cy={0}
                    r={radarScale(tickValue)}
                    stroke="black"
                    fill="transparent"
                  /> */}
                  <Path
                    d={
                      partialCirclePathD(
                        0,
                        0,
                        radarScale(tickValue),
                        startRad,
                        endRad,
                      )
                    }
                  />
                  <Text
                    x={-5}
                    y={-radarScale(tickValue) + 5}
                  >
                    {`${tickValue} ${lang === 'fr' ? 'tx' : 'b'}.`}
                  </Text>
                </g>
              )
            })
          }
        </g>
        : null
      }
      {
        dominantMode ? null :
        // triangles
        points
        .map(([x, y], pointIndex) => {
          const next = pointIndex < points.length - 1 ? points[pointIndex + 1] : points[0]
          const [nextX, nextY] = next;
          const midX = 0;
          const midY = 0;
          const triangleD = `M ${x} ${y} L ${nextX} ${nextY} L ${midX} ${midY} Z`;
          const colorVar = 30 + parseInt(pointIndex / points.length * 30);
          return (
            <path
              d={triangleD}
              className="radar-triangle"
              stroke="none"
              fill={`hsl(192,42%, ${colorVar}%)`}
              fillOpacity={.8}
              key={pointIndex}
            />
          )
        })
      }
      { dominantMode ? null :
        points
        .filter(([_x, _y, isMid = true]) => isMid)
        .map(([x, y], pointIndex) => {
          const flag = flagGroupModalities[pointIndex];
          const tonnage = flagGroups[flag]?.tonnage || 0;
          return (
            <circle
              cx={x}
              cy={y}
              key={pointIndex}
              r={highlighted ? radius / 30 : radius / 15}
              className="radar-point"
              style={{fill: generic20colors[pointIndex]}}
              data-for="destinations-tooltip"
              data-tip={translate('CarteDestinations', 'tonnage_for_destination_and_flag', lang, {destination, flag, tonnage: formatNumber(tonnage, lang)}) + ` (${parseInt(tonnage / sumTonnage * 100)}%)`}
            />
          )
        })
      }
      <text 
        x={radius + radius /10}
        y={0}
        fontSize={fontSize}
        className="radar-label"
      >
        {lang === 'fr' ? destination : destination_en}
      </text>
      {
        overflowing ?
        <g
          transform={`rotate(${arrowRotate})translate(${radius}, 0)`}
        >
          <line
            x1={2}
            x2={2}
            y1={0}
            y2={0}
            className="arrow"
            markerEnd="url(#arrowhead)"
          />
        </g>
        : null
      }
    </g>
  );
}

export default Destination;