import React, { useContext, useMemo, useState } from "react";

import { VisualisationContext } from "../../utils/contexts";

export default function TimelineFragment({
    width,
    height,
    x,
    y,
    color = 'black',
    lockShowTitle = false,
    label = '',
    id,
    ...props
}) {
    const [showTitle, setShowTitle] = useState(lockShowTitle);

    const {
        changeMapView
    } = useContext(VisualisationContext);

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