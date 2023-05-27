import React, { useEffect, useMemo, useState } from "react";
import { useSpring, animated } from 'react-spring'

let timeOut;

export default function MapPoints({
    data: inputData,
    displayedYear,
    height,
    lang,
    palette,
    ...props
}) {
    const [hoverId, setHoverId] = useState(undefined);
    const [styles, setStyles] = useSpring(() => ({ opacity: 1 }))

    const data = useMemo(function setIdForEachPoint() {
        return inputData.map((point, i) => {
            return {
                ...point,
                id: i,
                label: point[`label_${lang}`]
            }
        })
    }, [inputData, lang]);

    useEffect(() => {
        setStyles.start({ opacity: 1 })
        clearTimeout(timeOut);
        timeOut = setTimeout(() => {
            setStyles.start({ opacity: 0 })
        }, 2000);
    }, [displayedYear]);

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
                    if (year_start <= displayedYear && (year_end === '' || displayedYear < year_end)) {
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
                                key={i}
                            >
                                <g
                                    onMouseEnter={(e) => setHoverId(id)}
                                    onMouseLeave={(e) => setHoverId(undefined)}
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
                                </g>
                                <foreignObject
                                    y={-5}
                                    x={20}
                                    width='250px'
                                    height='40px'
                                >
                                    <animated.p
                                        xmlns="http://www.w3.org/1999/xhtml"
                                        style={{
                                            ...styles,
                                            color: 'white',
                                            display: 'inline-block',
                                            padding: '2px',
                                            backgroundColor: color
                                        }}
                                    >{label}</animated.p>
                                </foreignObject>
                                {
                                    hoverId === id &&
                                    <foreignObject
                                        y={-5}
                                        x={20}
                                        width='250px'
                                        height='30px'
                                    >
                                        <p
                                            xmlns="http://www.w3.org/1999/xhtml"
                                            style={{
                                                ...styles,
                                                color: 'white',
                                                display: 'inline-block',
                                                padding: '2px',
                                                backgroundColor: color
                                            }}
                                        >{label}</p>
                                    </foreignObject>
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