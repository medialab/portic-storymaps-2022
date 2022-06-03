import React, { useMemo, useState } from "react";

import { VisualisationContext } from "../../utils/contexts";

/**
 * Timeline fragment, as a time event or period
 * @param {Object} props
 * @param {Number} props.width
 * @param {Number} props.height
 * @param {Number} props.x
 * @param {Number} props.y
 * @param {String} [props.color]
 * @param {String} [props.label]
 * @param {String} props.label
 * @returns 
 */

export default function TimelineFragment({
    width,
    height,
    x,
    y,
    color = 'black',
    lockShowTitle = false,
    label = '',
    ...props
}) {
    const [showTitle, setShowTitle] = useState(lockShowTitle);

    const {
        heightForSpan,
        heightForLabel
    } = useMemo(() => {
        const heightForLabel = 10;
        return {
            heightForSpan: height - heightForLabel,
            heightForLabel
        }
    }, [height])

    // const { ySpan, yLabel } = useMemo(() => {
    //     return {
    //         ySpan: 0,
    //         yLabel: heightForSpan + heightForLabel
    //     }
    // }, [heightForSpan, heightForLabel])

    // scale reverse

    function onMouseEnter() {
        setShowTitle(true);
    }

    function onMouseLeave() {
        if (lockShowTitle) { return; }
        setShowTitle(false);
    }

    return (
        <g
            transform={`translate(${x}, ${y})`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <rect
                fill={color}
                width={width}
                height={heightForSpan}
            />
            {
                showTitle &&
                <g>
                    <text y={heightForSpan + heightForLabel} x={0} fontSize={10} color="red">{label}</text>
                </g>
            }
        </g>
    )
}