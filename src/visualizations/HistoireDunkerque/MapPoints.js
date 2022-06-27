import React, { useEffect, useMemo, useRef, useState } from "react";

export default function MapPoints({
    data: inputData,
    diplayedYear,
    height,
    ...props
}) {
    const [hoverId, setHoverId] = useState(undefined);

    const data = useMemo(function setIdForEachPoint() {
        return inputData.map((point, i) => {
            return {
                id: i,
                ...point
            }
        })
    }, [inputData]);

    return (
        <svg
            width='100%'
            height={height}
            viewBox="0 0 920 836"
        >
            {
                data.map(({
                    year_start,
                    year_end,
                    x,
                    y,
                    label,
                    color,
                    id
                }) => {
                    if (year_start <= diplayedYear && (year_end === '' || diplayedYear < year_end)) {
                        return (
                            <g
                                transform={`translate(${x}, ${y})`}
                                onMouseEnter={(e) => setHoverId(id)}
                                onMouseLeave={(e) => setHoverId(undefined)}
                            >
                                <circle
                                    cx={0}
                                    cy={0}
                                    r={5}
                                    fill={color}
                                />
                                {
                                    (+year_start === diplayedYear || hoverId === id) &&
                                    <g>
                                        <text y={0} x={15} stroke={color} strokeWidth='0.6em'>{label}</text>
                                        <text y={0} x={15} fill='white'>{label}</text>
                                    </g>
                                }
                            </g>
                        )
                    }
                    return null;
                })
            }
        </svg>
    )
}