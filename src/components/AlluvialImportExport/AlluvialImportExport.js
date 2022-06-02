import React, { useMemo } from "react";

// import { scaleLinear } from "d3-scale";
import { group } from 'd3-array'

export default function AlluvialImportExport({
    data,
    dimensions,
    ...props
}) {
    const { width, height } = dimensions;
    const barWidth = 70;
    const arrowMargin = 10;

    /** @type {Map} */
    const partners = useMemo(function groupPartners() {
        return group(data, d => d.partner_type)
    }, [data]);

    /** @type {Map} */
    const products = useMemo(function groupProducts() {
        return group(data, d => d.product_type)
    }, [data]);

    const drawBlocksHeight = useMemo(function getHeightForEachSvgBlock() {
        return {
            productBar: height * 0.45,
            partnerBar: height * 0.45,
            centerCircle: height * 0.1
        }
    }, [height]);

    return (
        <svg
            {...{
                width,
                height
            }}
            style={{ border: '1px solid black' }}
        >
            <defs>
                <marker id='arrow-head' orient='auto' markerWidth='10' markerHeight='6' refX='0.1' refY='2'>
                    <path d='M0,0 V4 L2,2 Z' fill='black' />
                </marker>
            </defs>
            <g
                className="product-bar"
                transform={`translate(${width / 2 - barWidth / 2}, ${0})`}
            >
                <rect
                    x={0}
                    y={0}
                    width={barWidth}
                    height={drawBlocksHeight.productBar}
                />
            </g>
            <g
                className="center-circle"
                transform={`translate(${width / 2 - barWidth / 2}, ${drawBlocksHeight.productBar})`}
            >
                <path
                    d={`
                    M ${barWidth / 2 - arrowMargin} ${drawBlocksHeight.centerCircle - arrowMargin}
                    Q ${-10} ${drawBlocksHeight.centerCircle / 2} ${barWidth / 2 - arrowMargin} ${arrowMargin}
                    `}
                    strokeWidth={2}
                    stroke='black'
                    fill='transparent'
                    markerEnd='url(#arrow-head)'
                />
                <path
                    d={`
                    M ${barWidth / 2 + arrowMargin} ${arrowMargin}
                    Q ${barWidth + 10} ${drawBlocksHeight.centerCircle / 2} ${barWidth / 2 + arrowMargin} ${drawBlocksHeight.centerCircle - arrowMargin}
                    `}
                    strokeWidth={2}
                    stroke='black'
                    fill='transparent'
                    markerEnd='url(#arrow-head)'
                />
            </g>
            <g
                className="partner-bar"
                transform={`translate(${width / 2 - barWidth / 2}, ${drawBlocksHeight.productBar + drawBlocksHeight.centerCircle})`}
            >
                <rect
                    x={0}
                    y={0}
                    width={barWidth}
                    height={drawBlocksHeight.productBar}
                />
            </g>
        </svg>
    )
}