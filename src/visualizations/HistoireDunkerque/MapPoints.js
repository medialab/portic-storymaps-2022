import React, { useMemo, useState } from "react";

export default function MapPoints({
    data: inputData,
    diplayedYear,
    height,
    lang,
    palette,
    ...props
}) {
    const [hoverId, setHoverId] = useState(undefined);

    const data = useMemo(function setIdForEachPoint() {
        return inputData.map((point, i) => {
            return {
                ...point,
                id: i,
                label: point[`label_${lang}`]
            }
        })
    }, [inputData, lang]);

    return (
        <svg
            width='100%'
            height='100%'
            viewBox="0 0 920 836"
        >
            {
                data.map(({
                    year_start,
                    year_end,
                    x,
                    y,
                    label,
                    color_type,
                    shape,
                    id
                }, i) => {
                    if (year_start <= diplayedYear && (year_end === '' || diplayedYear < year_end)) {
                        const color = palette[color_type];
                        const crossD = `
                        M 5,5
                        l 10,10
                        M 15,5
                        l -10,10
                        `
                        return (
                            <g
                                transform={`translate(${x}, ${y})`}
                                onMouseEnter={(e) => setHoverId(id)}
                                onMouseLeave={(e) => setHoverId(undefined)}
                                key={i}
                            >
                                {
                                    (shape === 'circle') &&
                                    <circle
                                        cx={10}
                                        cy={10}
                                        r={5}
                                        fill={color}
                                        stroke='white'
                                    />
                                }
                                {
                                    (shape === 'cross') &&
                                    <g>
                                        <path
                                            d={crossD}
                                            strokeWidth={6}
                                            stroke='white'
                                        />
                                        <path
                                            d={crossD}
                                            strokeWidth={4}
                                            stroke={color}
                                        />
                                    </g>
                                }
                                {
                                    (+year_start === diplayedYear || hoverId === id) &&
                                    <g>
                                        <text y={15} x={20} stroke={color} strokeWidth='0.6em'>{label}</text>
                                        <text y={15} x={20} fill='white'>{label}</text>
                                    </g>
                                    // <foreignObject
                                    // y={0}
                                    // x={15}
                                    // width='100px'
                                    // height='20px'
                                    // >
                                    //     <div
                                    //     xmlns="http://www.w3.org/1999/xhtml"
                                    //     style={{
                                    //         color: 'white',
                                    //         backgroundColor: color,
                                    //     }}
                                    //     >{label}</div>
                                    // </foreignObject>
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