import React, {useState} from "react";
import Measure from 'react-measure';

/**
 * @param {Object} props
 * @param {String} props.text
 * @param {String} props.arrowId
 * @param {String} props.arrowColor
 * @param {Number} props.arrowStrokeWidth
 * @param {Number} props.textWidth size of text box and x position of arrow begin
 * @param {Number} props.textHeight size of text box and y position of arrow begin
 * @param {Object} props.textStyle CSS styles
 * @param {Number} props.x1 x position of text (top-left corner)
 * @param {Number} props.y1 y position of text (top-left corner)
 * @param {Number} props.x2 x position of arrow pointer
 * @param {Number} props.y2 y position of arrow pointer
 * @param {boolean} props.debug show points at draw breakpoints
 * @returns
 * @exemple
 * ```
 * <marker id='MARKER-ID' orient='auto' markerWidth='10' markerHeight='6' refX='0.1' refY='2'>
 *      <path d='M0,0 V4 L2,2 Z' fill='black' />
 * </marker>
 * <ArrowNote
 *      arrowId='MARKER-ID'
 *      text='Lorem ipsum'
 *      textWidth={160}
 *      textHeight={40}
 *      x1={-50}
 *      y1={-20}
 *      x2={150}
 *      y2={60}
 * />
 * ```
 */

export default function ArrowNote({
  text,
  arrowId,
  // arrowColor = 'black',
  // arrowStrokeWidth = 2,
  textWidth = 100,
  textHeight = 100,
  textAlign = 'left',
  arrowPosition = 'center center',
  x1,
  y1,
  x2,
  y2,
  debug = false
}) {
  const [dimensions, setDimensions] = useState({
    width: 10,
    height: 10,
  });
  // const inverseArrowX = x1 > x2;
  // const inverseArrowY = y1 > y2;

  // let xArrowBegin, yArrowBegin;

  // if (inverseArrowX) {
  //   xArrowBegin = x1;
  // } else {
  //   xArrowBegin = x1 + textWidth
  // }

  // if (inverseArrowY) {
  //   yArrowBegin = y1;
  // } else {
  //   yArrowBegin = y1 + textHeight;
  // }

  // const displaceY = Math.abs(y2 - yArrowBegin) / 5;

  let arrowStartX = x1 + dimensions.width / 2;
  let arrowStartY = y1 + dimensions.height / 2;
  const [arrowPositionY, arrowPositionX] = arrowPosition.split(' ');
  if (arrowPositionY === 'top') {
    arrowStartY = y1;
  } else if (arrowPositionY === 'bottom') {
    arrowStartY = y1 + dimensions.height;
  }
  if (arrowPositionX === 'left') {
    arrowStartX = x1;
  } else if (arrowPositionX === 'right') {
    arrowStartX = x1 + dimensions.width;
  }

  return (
    <g
      className="ArrowNote"
    >
      <line
        x1={arrowStartX}
        y1={arrowStartY}
        x2={x2}
        y2={y2}
        // stroke={arrowColor}
        // strokeWidth={arrowStrokeWidth}
        markerEnd={`url(#${arrowId})`}
        fill='transparent'
      />
      {/* <path
        d={
          `
                M${xArrowBegin},${yArrowBegin}
                C${xArrowBegin},${yArrowBegin + displaceY} ${xArrowBegin + displaceY},${y2} ${x2},${y2}
                `
        }
        stroke={arrowColor}
        strokeWidth={arrowStrokeWidth}
        markerEnd={`url(#${arrowId})`}
        fill='transparent'
      /> */}
      {
        debug &&
        <rect
          x={x1}
          y={y1}
          width={dimensions.width}
          height={dimensions.height}
          fill="transparent"
          stroke="red"
        />
      }
      
      <Measure
        bounds
        onResize={contentRect => {
          setDimensions(contentRect.bounds)
        }}
      >
        {({ measureRef }) => (
          <foreignObject
            x={x1}
            y={y1}
            width={textWidth}
            height={textHeight}
          >
            <p
              xmlns="http://www.w3.org/1999/xhtml"
              ref={measureRef}
              style={{
                textAlign,
                // textAlign: inverseArrowX ? 'left' : 'right',
                // ...textStyle
              }}
            >{text}</p>
          </foreignObject>
        )}
      </Measure>


      {
        debug &&
        <g>
          <circle cx={x1} cy={y1} r={2} stroke='red' />
          <circle cx={xArrowBegin} cy={yArrowBegin} r={2} stroke='red' />
          <circle cx={x2} cy={y2} r={2} stroke='red' />
        </g>
      }
    </g>
  )
}