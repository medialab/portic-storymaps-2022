import React, { useMemo } from "react";

import { scaleLinear } from "d3-scale";
import { group, groups, index, rollup, sum, max } from 'd3-array'
import { partialCirclePathD, _partialCirclePathD } from "../../utils/misc";
import iwanthue from 'iwanthue';

export default function AlluvialImportExport({
    data,
    dimensions,
    decreasing = false,
    ...props
}) {
    const { width, height } = dimensions;
    const barWidth = 70;
    const arrowMargin = 10;

    function sortCategories(a, b) {
        const [aCategory, aCategoryArray] = a;
        const [bCategory, bCategoryArray] = b;
        const aCategoryValue = sum(aCategoryArray, d => d.value)
        const bCategoryValue = sum(bCategoryArray, d => d.value)
        if (decreasing) {
            if (aCategoryValue < bCategoryValue) { return 1; }
            if (aCategoryValue > bCategoryValue) { return -1; }
        } else {
            if (aCategoryValue < bCategoryValue) { return -1; }
            if (aCategoryValue > bCategoryValue) { return 1; }
        }
        return 0;
    }

    const drawBlocksHeight = useMemo(function getHeightForEachSvgBlock() {
        return {
            productBar: height * 0.45,
            partnerBar: height * 0.45,
            centerCircle: height * 0.1
        }
    }, [height]);

    function getMaxValueBetweenExportsnImports(productArray) {
        return max([
            sum(productArray.filter(({ importsexports }) => importsexports === 'Imports'), d => d.value),
            sum(productArray.filter(({ importsexports }) => importsexports === 'Exports'), d => d.value)
        ])
    }

    const rangeProductValue = useMemo(function setRangeFxForProduct() {
        const { productBar } = drawBlocksHeight;
        let refValue = 0;
        const productGroups = groups(data, d => d.product_type);
        for (const [productName, productArray] of productGroups) {
            const maxValueBetweenExportsnImports = getMaxValueBetweenExportsnImports(productArray);
            refValue += maxValueBetweenExportsnImports;
        }

        return scaleLinear()
            .domain([0, refValue])
            .range([0, productBar])
    }, [data, drawBlocksHeight]);

    const rangePartnerValue = useMemo(function setRangeFxForProduct() {
        const { partnerBar } = drawBlocksHeight;
        let refValue = 0;
        const partnerGroups = groups(data, d => d.partner_type);
        for (const [partnerName, partnerArray] of partnerGroups) {
            if (partnerName === 'Fraude') { continue; }
            const maxValueBetweenExportsnImports = getMaxValueBetweenExportsnImports(partnerArray);
            refValue += maxValueBetweenExportsnImports;
        }

        return scaleLinear()
            .domain([0, refValue])
            .range([0, partnerBar])
    }, [data, drawBlocksHeight]);

    /** @type {Array} */
    const dataReclassify = useMemo(function groupLittleValues() {
        const dataReclassify = [];
        for (const productLine of data) {
            const valueRange = rangeProductValue(productLine.value);
            if (valueRange < 15) {
                productLine['product_type'] = 'Autres';
            }
            dataReclassify.push(productLine);
        }
        return dataReclassify;
    }, [data]);

    /** @type {Map} */
    const partners = useMemo(function groupPartners() {
        return groups(dataReclassify, d => d.partner_type);
    }, [dataReclassify]);

    /** @type {Map} */
    const products = useMemo(function groupProducts() {
        return groups(dataReclassify, d => d.product_type).sort(sortCategories);
    }, [dataReclassify]);

    const links = useMemo(function getLinksBetweenProductsNPartners() {
        const links = {
            ['Imports']: [],
            ['Exports']: []
        };

        let iPartnerValue = 0;
        let partnersY = Object.fromEntries(partners.entries());

        for (const [partnerName, partnerArray] of partners) {
            if (partnerName === 'Fraude') { continue; }
            partnersY[partnerName] = iPartnerValue; // rangePartnerValue(iPartnerValue)
            const productValueForAllPartners = getMaxValueBetweenExportsnImports(partnerArray);
            iPartnerValue += productValueForAllPartners;
        }

        partnersY = {
            ['Imports']: partnersY,
            ['Exports']: partnersY
        };

        let iProductValue = {
            ['Imports']: 0,
            ['Exports']: 0
        };

        for (const [productName, productArray] of products) {
            for (const { value, partner_type, importsexports } of productArray) {
                switch (importsexports) {
                    case 'Imports':
                        links[importsexports].push({
                            value,
                            from: (
                                partner_type === 'Fraude' ?
                                    {
                                        partner_type,
                                        y: 0
                                    } :
                                    {
                                        partner_type,
                                        y: rangePartnerValue(partnersY[importsexports][partner_type])
                                    }
                            ),
                            to: {
                                productName,
                                y: rangeProductValue(iProductValue[importsexports])
                            }
                        });
                        break;
                    case 'Exports':
                        links[importsexports].push({
                            value,
                            from: {
                                productName,
                                y: rangeProductValue(iProductValue[importsexports])
                            },
                            to: (
                                partner_type === 'Fraude' ?
                                    {
                                        partner_type,
                                        y: 0
                                    } :
                                    {
                                        partner_type,
                                        y: rangePartnerValue(partnersY[importsexports][partner_type])
                                    }
                            )
                        });
                        break;
                }

                iProductValue[importsexports] += value;
                partnersY[importsexports][partner_type] += value;
            }
        }
        return links;
    }, [partners, products, rangeProductValue]);

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
                    Array.from(products).map(([productName, productArray], iProduct) => {
                        const color = iwanthue(1, { seed: productName });
                        const productValueForAllPartners = getMaxValueBetweenExportsnImports(productArray)
                        const drawProductGroup = (
                            <g
                                transform={`translate(${0} ${rangeProductValue(iProductValue)})`}
                                key={iProduct}
                            >
                                <rect
                                    x={0}
                                    y={0}
                                    width={barWidth}
                                    height={rangeProductValue(productValueForAllPartners)}
                                    fill={color}
                                />
                                <text x={0} y={15} fontSize={15}>{productName}</text>
                            </g>
                        )
                        iProductValue += productValueForAllPartners;
                        return drawProductGroup;
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
                <path
                    transform={`translate(${barWidth + arrowMargin} ${drawBlocksHeight.centerCircle / 2}) rotate(180)`}
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
            <g
                className="partner-bar"
                transform={`translate(${width / 2 - barWidth / 2}, ${drawBlocksHeight.productBar + drawBlocksHeight.centerCircle})`}
            >
                {
                    partners.map(([partnerName, partnerArray], iPartner) => {
                        const color = iwanthue(1, { seed: partnerName });
                        const productValueForAllPartners = getMaxValueBetweenExportsnImports(partnerArray);
                        const drawProductGroup = (
                            <g
                                transform={`translate(${0} ${rangePartnerValue(iPartnerValue)})`}
                                key={iPartner}
                            >
                                <rect
                                    x={0}
                                    y={0}
                                    width={barWidth}
                                    height={rangePartnerValue(productValueForAllPartners)}
                                    fill={color}
                                />
                                <text x={0} y={15} fontSize={15}>{partnerName}</text>
                            </g>
                        )
                        iPartnerValue += productValueForAllPartners;
                        return drawProductGroup;
                    })
                }
            </g>
            <g>
                {
                    links['Imports'].map(({ value, from, to }, iLink) => {
                        iLink++;
                        const color = iwanthue(1, { seed: from.partner_type });
                        if (from.partner_type === 'Fraude') {
                            return (
                                <path
                                    key={iLink}
                                    d={`
                                    M ${width / 2 - barWidth / 2}, ${drawBlocksHeight.productBar + drawBlocksHeight.centerCircle + from.y}
                                    h -${width / 3}
                                    v ${rangeProductValue(value)}
                                    h ${width / 3}
                                    Z
                                    `}
                                    fill={color}
                                />
                            )
                        }
                        return (
                            <path
                                key={iLink}
                                d={`
                                M ${width / 2 - barWidth / 2}, ${drawBlocksHeight.productBar + drawBlocksHeight.centerCircle + from.y}
                                h -${iLink * 10}
                                V ${to.y}
                                h ${iLink * 10}
                                `}
                                strokeWidth={2}
                                stroke={color}
                                fill='transparent'
                                markerEnd='url(#arrow-head)'
                            />
                            // <g
                            //     transform={`translate(${width / 2 - barWidth / 2}, ${0})`}
                            //     key={iLink}
                            // >
                            //     <path
                            //         d={partialCirclePathD(
                            //             0,
                            //             (drawBlocksHeight.productBar + drawBlocksHeight.centerCircle + from.y) / 2,
                            //             (drawBlocksHeight.productBar + drawBlocksHeight.centerCircle + from.y) / 2,
                            //             Math.PI / 2,
                            //             Math.PI * 3 / 2,
                            //         )}
                            //         strokeWidth={2}
                            //         stroke='black'
                            //         fill='transparent'
                            //         markerEnd='url(#arrow-head)'
                            //     />
                            // </g>
                        )
                    })
                }
            </g>
            <g>
                {
                    links['Exports'].map(({ value, from, to }, iLink) => {
                        iLink++;
                        const color = iwanthue(1, { seed: from.productName });
                        if (to.partner_type === 'Fraude') {
                            return (
                                <path
                                    key={iLink}
                                    d={`
                                    M ${width / 2 + barWidth / 2}, ${from.y}
                                    h ${width / 3}
                                    v ${rangeProductValue(value)}
                                    h -${width / 3}
                                    Z
                                    `}
                                    fill={color}
                                />
                            )
                        }
                        return (
                            <path
                                key={iLink}
                                d={`
                                M ${width / 2 + barWidth / 2}, ${from.y}
                                h ${iLink * 10}
                                V ${drawBlocksHeight.productBar + drawBlocksHeight.centerCircle + to.y}
                                h -${iLink * 10}
                                `}
                                strokeWidth={2}
                                stroke={color}
                                fill='transparent'
                                markerEnd='url(#arrow-head)'
                            />
                        )
                    })
                }
            </g>
        </svg>
    )
}