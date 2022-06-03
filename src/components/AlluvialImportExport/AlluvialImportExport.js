import React, { useMemo } from "react";

import { scaleLinear } from "d3-scale";
import { group, sum } from 'd3-array'
import { partialCirclePathD } from "../../utils/misc";
import iwanthue from 'iwanthue';

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
        return group(data, d => d.partner_type);
    }, [data]);

    /** @type {Map} */
    const products = useMemo(function groupProducts() {
        return group(data, d => d.product_type);
    }, [data]);

    const drawBlocksHeight = useMemo(function getHeightForEachSvgBlock() {
        return {
            productBar: height * 0.45,
            partnerBar: height * 0.45,
            centerCircle: height * 0.1
        }
    }, [height]);

    const rangeProductValue = useMemo(function setRangeFxForProduct() {
        const { productBar } = drawBlocksHeight;
        const totalValue = sum(data, d => d.value);
        return scaleLinear()
            .domain([0, totalValue])
            .range([0, productBar])
    }, [data, drawBlocksHeight]);

    const range = useMemo(function setRangeFxForProduct() {
        const { productBar } = drawBlocksHeight;
        return scaleLinear()
            .domain([0, data.length])
            .range([0, productBar])
    }, [data, drawBlocksHeight]);

    // const links = useMemo(function deduceLinksFromData() {

    // }, [data])

    let iProductValue = 0;
    let iPartnerValue = 0;

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
                {
                    Array.from(products).map(([productName, productArray]) => {
                        const color = iwanthue(1, { seed: productName });
                        return productArray.map(({ value }, iLine) => {
                            const item = (
                                <g
                                    transform={`translate(${0} ${rangeProductValue(iProductValue)})`}
                                    key={iLine}
                                >
                                    <rect
                                        x={0}
                                        y={0}
                                        width={barWidth}
                                        height={rangeProductValue(value)}
                                        fill={color}
                                    />
                                </g>
                            )
                            iProductValue += value;
                            return item;
                        })
                    })
                }
            </g>
            <g
                className="center-circle"
                transform={`translate(${width / 2 - barWidth / 2}, ${drawBlocksHeight.productBar})`}
            >
                <path
                    d={partialCirclePathD(
                        -Math.abs(0 + arrowMargin),
                        drawBlocksHeight.centerCircle / 2,
                        barWidth - 10,
                        Math.PI / 2,
                        Math.PI * 3 / 2,
                    )}
                    strokeWidth={2}
                    stroke='black'
                    fill='transparent'
                    markerEnd='url(#arrow-head)'
                />
                <g transform={`translate(${barWidth + arrowMargin} ${drawBlocksHeight.centerCircle / 2}) rotate(180)`} >
                    <path
                        d={partialCirclePathD(
                            0,
                            0,
                            barWidth - 10,
                            Math.PI / 2,
                            Math.PI * 3 / 2,
                            // true
                        )}
                        strokeWidth={2}
                        stroke='black'
                        fill='transparent'
                        markerEnd='url(#arrow-head)'
                    />
                </g>
            </g>
            <g
                className="partner-bar"
                transform={`translate(${width / 2 - barWidth / 2}, ${drawBlocksHeight.productBar + drawBlocksHeight.centerCircle})`}
            >
                {/* <rect
                    x={0}
                    y={0}
                    width={barWidth}
                    height={drawBlocksHeight.productBar}
                /> */}
                {
                    Array.from(partners).map(([partnerName, partnerArray]) => {
                        const color = iwanthue(1, { seed: partnerName });
                        return partnerArray.map(({ value }, iLine) => {
                            console.log(value);
                            const item = (
                                <g
                                    transform={`translate(${0} ${rangeProductValue(iPartnerValue)})`}
                                    key={iLine}
                                >
                                    <rect
                                        x={0}
                                        y={0}
                                        width={barWidth}
                                        height={rangeProductValue(value)}
                                        fill={color}
                                    />
                                    {/* <text x={0} y={0}>{partnerName}</text> */}
                                </g>
                            )
                            iPartnerValue += value;
                            return item;
                        })
                    })
                }
            </g>
        </svg>
    )
}