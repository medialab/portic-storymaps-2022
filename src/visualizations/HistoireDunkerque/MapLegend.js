import React, { useMemo } from "react";

import DiagonalHatching from "../../components/DiagonalHatching";
import translate from "../../utils/translate";

/**
 * 
 * @param {Object} props
 * @param {Object} props.values
 * @param {Boolean} props.values.legend_square_port_free
 * @param {Boolean} props.values.legend_square_kingdom_france
 * @param {Boolean} props.values.legend_point_port_interests
 * @param {Boolean} props.values.legend_point_guard
 * @param {Boolean} props.values.legend_point_kingdom_dependency
 * @returns 
 */

export default function MapLegend({
    values,
    lang,
    palette,
    height,
    width,
    ...props
}) {
    const {
        legend_square_port_free,
        legend_square_kingdom_france,
        legend_point_port_interests,
        legend_point_guard,
        legend_point_kingdom_dependency
    } = values;

    const fontSize = 10;

    return (
        <svg
            {... { height, width }}
        >
            <DiagonalHatching id='diag-hatch' lineGap={5} color='red' />
            <g
                transform={`translate(${0}, ${0})`}
            >
                {
                    legend_square_port_free &&
                    <g>
                        <rect
                            width={30}
                            height={30}
                            fill={palette['tax-free']}
                            stroke='black'
                        />
                        <text
                            y={20}
                            x={35}
                            fontSize={fontSize}
                        >{translate('HistoireDunkerque', 'legend_square_port_free', lang)}</text>
                    </g>
                }
                {
                    legend_square_kingdom_france &&
                    <g
                        transform={`translate(${width / 2}, ${0})`}
                    >
                        <rect
                            width={30}
                            height={30}
                            fill={palette['France']}
                            stroke='black'
                        />
                        <foreignObject
                            y={-5}
                            x={35}
                            width='60px'
                            height='35px'
                        >
                            <p
                                xmlns="http://www.w3.org/1999/xhtml"
                                style={{
                                    fontSize: fontSize,
                                    fontFamily: 'inherit'
                                }}
                            >{translate('HistoireDunkerque', 'legend_square_kingdom_france', lang)}</p>
                        </foreignObject>
                    </g>
                }
            </g>
            {
                legend_point_port_interests &&
                <g
                    transform={`translate(${0}, ${40})`}
                >
                    <circle
                        cx={7}
                        cy={7}
                        r={7}
                        fill={palette['point-port']}
                    />
                    <text
                        y={10}
                        x={20}
                        fontSize={fontSize}
                    >{translate('HistoireDunkerque', 'legend_point_port_interests', lang)}</text>
                </g>
            }
            {
                legend_point_guard &&
                <g
                    transform={`translate(${0}, ${60})`}
                >
                    <path
                        d={`
                        M 2,2
                        l 10,10
                        M 12,2
                        l -10,10
                        `}
                        strokeWidth={4}
                        stroke={palette['point-kingdom']}
                    />
                    <text
                        y={10}
                        x={20}
                        fontSize={fontSize}
                    >{translate('HistoireDunkerque', 'legend_point_guard', lang)}</text>
                </g>
            }
            {
                legend_point_kingdom_dependency &&
                <g
                    transform={`translate(${0}, ${80})`}
                >
                    <circle
                        cx={7}
                        cy={7}
                        r={7}
                        fill={palette['point-kingdom']}
                    />
                    <text
                        y={10}
                        x={20}
                        fontSize={fontSize}
                    >{translate('HistoireDunkerque', 'legend_point_kingdom_dependency', lang)}</text>
                </g>
            }
        </svg>
    )
}