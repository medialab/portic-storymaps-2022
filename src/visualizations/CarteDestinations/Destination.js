import {useMemo} from 'react';
import { useSpring, animated } from "react-spring";
import {max} from 'd3-array';
import {scaleLinear} from 'd3-scale';
import palettes from '../../utils/colorPalettes';
import translate from '../../utils/translate';

const {generic20colors} = palettes;

const G = ({ children, className, onClick, ...inputProps }) => {
  const props = useSpring(inputProps);
  return (
    <animated.g className={className} onClick={onClick} {...props}>
      {children}
    </animated.g>
  )
}
const Circle = ({ children, className, onClick, ...inputProps }) => {
  const props = useSpring(inputProps);
  return (
    <animated.circle className={className} onClick={onClick} {...props}>
      {children}
    </animated.circle>
  )
}

const Text = ({ children, className, onClick, ...inputProps }) => {
  const props = useSpring(inputProps);
  return (
    <animated.text className={className} onClick={onClick} {...props}>
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


  highlighted,
  onClick,

  lang,
}) => {

  
  const maxTonnage = max(Object.values(flagGroups).map(g => g.tonnage));
  const sumTonnage = Object.values(flagGroups).reduce((sum, g) => sum + g.tonnage, 0);
  
  const {points, d} = useMemo(() => {
    // const radarScale = scaleLinear().domain([0, maxTonnage]).range([0, radius]);
    const radarScale = scaleLinear().domain([0, sumTonnage]).range([0, radius]);
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
      d: newD
    }
  }, [maxTonnage, flagGroupModalities, flagGroups, radius]); 

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
    <G
      transform={`translate(${x}, ${y})`}
      className={`destination ${highlighted ? 'is-highlighted' : ''}`}
      onClick={onClick}
    >
      <Circle
        cx={0}
        cy={0}
        r={radius}
        className={'background-circle'}
        data-for="destinations-tooltip"
        data-tip={destination}
      />
      {
        flagGroupModalities.map((modality, i) => {
          const deg = (i / flagGroupModalities.length) * 360 - 90;
          const theta = deg  * Math.PI / 180;
          const x2 = radius * Math.cos(theta);
          const y2 = radius * Math.sin(theta);
          return (
            <Line
              x1={0}
              key={modality}
              y1={0}
              x2={x2}
              y2={y2}
              className="radar-line"
            />
          )
        })
      }
      {/* <path
        d={d}
        className="radar-chart"
      /> */}
      {
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
            />
          )
        })
      }
      {
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
              data-tip={translate('CarteDestinations', 'tonnage_for_destination_and_flag', lang, {destination, flag, tonnage}) + ` (${parseInt(tonnage / sumTonnage * 100)}%)`}
            />
          )
        })
      }
      <Text 
        x={radius + radius /10}
        y={0}
        fontSize={fontSize}
        className="radar-label"
      >
        {destination}
      </Text>
      {
        overflowing ?
        <G
          transform={`rotate(${arrowRotate})translate(${radius}, 0)`}
        >
          <Line
            x1={2}
            x2={2}
            y1={0}
            y2={0}
            className="arrow"
            markerEnd="url(#arrowhead)"
          />
        </G>
        : null
      }
    </G>
  );
}

export default Destination;