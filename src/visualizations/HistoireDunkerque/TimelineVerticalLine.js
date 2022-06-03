import React from "react";

/**
 * Timeline vertical delimiter
 * @param {Object} props
 * @param {String} props.year
 * @param {Number} props.x
 * @param {Number} props.height
 * @param {String} props.color
 * @returns 
 */

export default function TimelineVerticalLine({
    year,
    x,
    height,
    color,
    ...props
}) {
    return (
        <g
            transform={`translate(${x}, ${0})`}
        >
            <line
                y1={height}
                y2={0}
                stroke={color}
                strokeWidth={1}
                {
                    ...props
                }
            ></line>
            <text y={height} x={5} fontSize={10} fill={color}>{year}</text>
        </g>
    )
}