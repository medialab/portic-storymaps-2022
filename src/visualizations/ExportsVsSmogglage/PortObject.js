import { useEffect } from "react";
import ReactTooltip from "react-tooltip";
import { AnimatedCircle, AnimatedGroup, AnimatedLine, AnimatedText } from "../../components/AnimatedSvgElements";
import translate from "../../utils/translate";
import colorsPalettes from "../../utils/colorPalettes";

const {britishColor} = colorsPalettes;

export default function PortObject({
  labelGroup,
  label,
  x,
  y,
  fontSize: inputFontSize,
  radius,
  labelX,
  labelY,
  onSelect,
  onDeselect,
  isActive,
  isDimmed,
  isHidden,
  onMouseOver,
  onMouseOut,
  lang = 'fr'
}) {
  let fontSize = inputFontSize;
  let textAnchor = 'start';
  let lineStartX = labelX;
  let lineStartY = labelY - fontSize / 2;
  let lineEndX = x + radius + 2;
  let lineEndY = y;
  if (labelGroup === 'left') {
    textAnchor = 'end';
    lineEndX = x - radius - 2;
  } else if (labelGroup === 'bottom') {
    textAnchor = 'middle';
    lineStartY -= fontSize * .8;
    lineEndX = x;
    lineEndY = y + radius + 2;
  }
  if (isActive) {
    fontSize = radius * .1;
    textAnchor = 'middle';
    labelX = x;
    labelY = y + radius + fontSize * 4;
  }

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [translate])
  return (
    <g  
      className={`PortObject ${isDimmed ? 'is-dimmed': ''} ${isHidden ? 'is-hidden': ''} ${isActive ? 'is-active': ''}`} 
      onClick={(e) => {
        onSelect(label);
        e.stopPropagation();
      }}
      onMouseOver={() => {
        onMouseOver(label);
      }}
      onMouseOut={() => {
        onMouseOut(label);
      }}
      // onMouseLeave={() => {
      //   onMouseOut(label);
      // }}
    >
      <AnimatedGroup transform={`translate(${x}, ${y})`}>
        <AnimatedCircle
          r={radius}
          cx={0}
          cy={0}
          fill={britishColor}
          stroke={"white"}
          style={{
            opacity: isActive ? 0 : 1
          }}
          title={label}
          data-for="smogglage-tip"
          data-tip={translate('ExportsVsSmogglage', 'tooltip_prompt', lang, {port: label})}
        />

      </AnimatedGroup>
      <AnimatedText
        x={labelX}
        y={labelY}
        fontSize={fontSize}
        textAnchor={textAnchor}
      >
        {label}
      </AnimatedText>
      <AnimatedText
        x={x + radius * 1.1}
        y={y - radius + fontSize * 2}
        fontSize={fontSize * 2}
        textAnchor="end"
        style={{
          pointerEvents: isActive ? 'all' : 'none',
          opacity: isActive ? 1 : 0,
          zIndex: 4
        }}
        onClick={e => {
          onDeselect(label);
          e.stopPropagation();
        }}
      >
        {`✕`}
      </AnimatedText>
      <AnimatedLine
        x1={lineStartX}
        y1={lineStartY}
        x2={lineEndX}
        y2={lineEndY}
        stroke="grey"
        strokeDasharray={'2,2'}
        style={{
          opacity: isActive ? 0 : 1
        }}
      />
    </g>
  )
}