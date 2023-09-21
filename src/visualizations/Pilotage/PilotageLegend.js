import React, { useMemo } from 'react';

import translate from '../../utils/translate';

export default function PilotageLegend({
    dimensions,
    colorPalette,
    lang,
    style = {},
    ...props
}) {
    const { width, height } = dimensions;

    return (
        <svg
            {...{ width, height, style }}
        >
            <g
                className='legend_pilotage'
                transform={`translate(0, 0)`}
            >
                <rect x={0} y={0} width={10} height={10} fill={colorPalette['sorties_pilotage']} />
                <foreignObject
                    y={0}
                    x={15}
                    width={width}
                    height={100}
                >
                    <p
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{ fontSize: 11, }}
                    >{translate('Pilotage', 'legend_pilotage', lang)}</p>
                </foreignObject>
            </g>

            <g
                className='legend_total'
                transform={`translate(0, ${height / 2})`}
            >
                <rect x={0} y={0} width={10} height={10} fill={colorPalette['total']} />
                <foreignObject
                    y={0}
                    x={15}
                    width={width}
                    height={100}
                >
                    <p
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{ fontSize: 11, }}
                    >{translate('Pilotage', 'legend_total', lang)}</p>
                </foreignObject>
            </g>
        </svg>
    )
}