import {useMemo} from 'react';
import { useSpring, animated } from "react-spring";
import {max} from 'd3-array';
import {scaleLinear} from 'd3-scale';


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
  onClick,
  overflowing,
  arrowDirection,

  flagGroupModalities,
}) => {
  const maxTonnage = max(Object.values(flagGroups).map(g => g.tonnage));
  
  const {points, d} = useMemo(() => {
    const radarScale = scaleLinear().domain([0, maxTonnage]).range([0, radius]);
    const newPoints = flagGroupModalities.reduce((res, modality, modalityIndex) => {
      const thatTonnage = flagGroups[modality] ? flagGroups[modality].tonnage : 0;
      const thatR = radarScale(thatTonnage);
      const deg = (modalityIndex / flagGroupModalities.length) * 360 - 90;
      const theta = deg  * Math.PI / 180;
      const thatX = thatR * Math.cos(theta);
      const thatY = thatR * Math.sin(theta);
      // if (modalityIndex !== flagGroupModalities.length - 1) {
      // const nextModalityIndex = (modalityIndex !== flagGroupModalities.length - 1) ? modalityIndex + 1 : 0;
      // const nextModality = flagGroupModalities[nextModalityIndex];
      // const nextTonnage = flagGroups[nextModality] ? flagGroups[nextModality].tonnage : 0;
      // const midTonnage = (thatTonnage + nextTonnage) / 2;
      // const midR = radarScale(midTonnage);
      // const nextDeg = (nextModalityIndex / flagGroupModalities.length) * 360;
      // const midDeg = (deg + nextDeg) / 2;
      // const midTheta = midDeg  * Math.PI / 180;
      // const midX = midR * Math.cos(midTheta);
      // const midY = midR * Math.sin(midTheta);
      // return [...res, [thatX, thatY, true], [midX, midY, false]];
      // }
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
  }, [overflowing, arrowDirection])

  return (
    <G
      transform={`translate(${x}, ${y})`}
      className="destination"
      onClick={onClick}
    >
      <Circle
        cx={0}
        cy={0}
        r={radius}
        className={'background-circle'}
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
      <path
        d={d}
        className="radar-chart"
      />
      {
        points
        .filter(([_x, _y, isMid = true]) => isMid)
        .map(([x, y], pointIndex) => {
          return (
            <circle
              cx={x}
              cy={y}
              key={pointIndex}
              r={radius / 20}
              className="radar-point"
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