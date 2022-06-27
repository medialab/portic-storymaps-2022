import React, { useMemo, useReducer, useState } from "react";

import { scaleLinear } from "d3-scale";
import { groups, max, sum } from 'd3-array'
import { formatNumber, partialCirclePathD } from "../../utils/misc";
import iwanthue from 'iwanthue';

import { AnimatedPath, AnimatedGroup } from '../AnimatedSvgElements';

export default function AlluvialImportExport({
    data: inputData,
    dimensions,
    decreasing = false,
    colorPalette = {},
    ...props
}) {
    const [focus, setFocus] = useReducer((currentState, action) => {
        let { actionType, itemType, itemValue, mode } = action;
        if (currentState && itemValue === currentState.itemValue) { actionType = 'reset' }
        switch (actionType) {
            case 'set':
                return {
                    itemType,
                    itemValue,
                    mode
                }
            case 'reset':
                return undefined;
        }
    }, undefined);

    const { width, height } = dimensions;
    const barWidth = 70;

    const data = useMemo(() => {
        // sort to get 'fraude' partner type on top of alluvial
        inputData = inputData.sort(({ partner_type: aPartner }) => {
            if (aPartner === 'Fraude') { return -1; }
            if (aPartner !== 'Fraude') { return 1; }
            return 0;
        })
        if (focus && focus.mode === 'filter') {
            switch (focus.itemType) {
                case 'product':
                    return inputData.filter(({ product_type }) => product_type === focus.itemValue);
                case 'partner':
                    return inputData.filter(({ partner_type }) => partner_type === focus.itemValue);
            }
        }
        if (focus && focus.mode === 'highlight') {
            switch (focus.itemType) {
                case 'product':
                    return inputData.map((row) => {
                        if (row['product_type'] === focus.itemValue) {
                            return {
                                isHighlight: true,
                                ...row
                            }
                        }
                        return {
                            isHighlight: false,
                            ...row
                        }
                    })
                case 'partner':
                    return inputData.map((row) => {
                        if (row['partner_type'] === focus.itemValue) {
                            return {
                                isHighlight: true,
                                ...row
                            }
                        }
                        return {
                            isHighlight: false,
                            ...row
                        }
                    })
            }
        }
        return inputData;
    }, [inputData, focus])

    const products = useMemo(function groupProducts() {
        return groups(data, d => d.product_type);
    }, [data]);

    const partners = useMemo(function groupPartners() {
        return groups(data, d => d.partner_type);
    }, [data]);

    const {
        productBarHeight,
        partnerBarHeight,
        centerCircleHeight,
        scaleValue,
        productsImportValue,
        partnersMaxValue
    } = useMemo(function getHeightForDraw() {
        /**
         * To size product bar,
         * need for each product the import value, as import value === export value
         */
        let productsImportValue = products.map(([product, productArray]) => {
            let productImportArray = [], productExportArray = [];
            for (const item of productArray) {
                switch (item['importsexports']) {
                    case 'Imports':
                        productImportArray.push(item); continue;
                    case 'Exports':
                        productExportArray.push(item); continue;
                }
            }
            const productImportTotal = sum(productImportArray, d => d.value);
            const productExportTotal = sum(productExportArray, d => d.value);
            return [
                product,
                max([productImportTotal, productExportTotal])
            ];
        });
        const productsTotalImportValue = sum(productsImportValue, d => d[1]);
        productsImportValue = Object.fromEntries(productsImportValue);

        /**
         * To size partner bar,
         * need for each partner the max value between import and export
         */
        let partnersMaxValue = partners.map(([partner, partnerArray]) => {
            if (partner === 'Fraude') { return [partner, 0]; }
            let partnerImportArray = [];
            let partnerExportArray = [];
            for (const { importsexports, value } of partnerArray) {
                switch (importsexports) {
                    case 'Imports': partnerImportArray.push(value); continue;
                    case 'Exports': partnerExportArray.push(value); continue;
                }
            }
            return [
                partner,
                max([
                    sum(partnerImportArray),
                    sum(partnerExportArray)
                ])
            ]
        });
        const partnerTotalValue = sum(partnersMaxValue, d => d[1]);
        partnersMaxValue = Object.fromEntries(partnersMaxValue);

        /**
         * Size of the center loop draw
         */
        const centerCircleHeight = 50;

        /**
         * Values to pixels
         */
        const scaleValue = scaleLinear()
            .domain([0, sum([productsTotalImportValue, partnerTotalValue])])
            .range([0, height - centerCircleHeight]);
        return {
            productBarHeight: scaleValue(productsTotalImportValue),
            partnerBarHeight: scaleValue(partnerTotalValue),
            centerCircleHeight,
            scaleValue,
            productsImportValue,
            partnersMaxValue
        }
    }, [height, products, partners]);

    const {
        productsDraw,
        partnersDraw,
        links
    } = useMemo(function positionElements() {
        const productsImportSorted = Object.entries(productsImportValue).sort((a, b) => {
            const [aName, aValue] = a;
            const [bName, bValue] = b;
            if (aValue < bValue) { return -1; }
            if (aValue > bValue) { return 1; }
        });
        const productsDraw = [];
        let iProductsImportValue = 0;
        for (const [product, value] of productsImportSorted) {
            productsDraw.push([
                product,
                iProductsImportValue
            ]);
            iProductsImportValue += value;
        }

        const partnersMaxSorted = Object.entries(partnersMaxValue)
            .sort(([aName, aValue], [bName, bValue]) => {
                if (aValue < bValue) { return -1; }
                if (aValue > bValue) { return 1; }
            });
        const partnersDraw = [];
        let iPartnersImportValue = 0;
        for (const [partner, value] of partnersMaxSorted) {
            partnersDraw.push([
                partner,
                iPartnersImportValue
            ]);
            iPartnersImportValue += value;
        }

        const links = {
            ['Imports']: [], // left side
            ['Exports']: [] // right side
        };
        const iProduct = {
            ['Imports']: Object.fromEntries(productsDraw),
            ['Exports']: Object.fromEntries(productsDraw)
        };
        const iPartner = {
            ['Imports']: Object.fromEntries(partnersDraw),
            ['Exports']: Object.fromEntries(partnersDraw)
        };

        for (const [product, productArray] of products) {
            for (const { value, partner_type, importsexports, isHighlight } of productArray) {
                const yProduct = iProduct[importsexports][product];
                const yPartner = iPartner[importsexports][partner_type];
                const isFraude = partner_type === 'Fraude';
                let item = {
                    value,
                    product,
                    isFraude,
                    isHighlight
                };
                switch (importsexports) {
                    case 'Imports':
                        item = {
                            ...item,
                            from: {
                                partner_type,
                                y: scaleValue(yPartner)
                            },
                            to: {
                                product,
                                y: scaleValue(yProduct)
                            }
                        }
                        break;

                    case 'Exports':
                        item = {
                            ...item,
                            from: {
                                product,
                                y: scaleValue(yProduct)
                            },
                            to: {
                                partner_type,
                                y: scaleValue(yPartner)
                            }
                        }
                        break;
                }
                links[importsexports].push(item);
                iProduct[importsexports][product] += value;
                iPartner[importsexports][partner_type] += value;
            }
        }
        return {
            links,
            productsDraw,
            partnersDraw
        };
    }, [products, partners, scaleValue]);

    const labelMargin = 5;

    console.log(focus);

    return (
        <svg
            {...{
                width,
                height
            }}
        >
            <defs>
                <marker id='arrow-head' orient='auto' markerWidth='10' markerHeight='6' refX='0.1' refY='2'>
                    <path d='M0,0 V4 L2,2 Z' fill='black' />
                </marker>
            </defs>
            <AnimatedGroup
                className="product-bar"
                transform={`translate(${width / 2 - barWidth / 2}, ${0})`}
            >
                {
                    productsDraw.map(([product, y], i) => {
                        y = scaleValue(y);
                        const productScale = scaleValue(productsImportValue[product]);
                        const color = colorPalette[product] || iwanthue(1, { seed: product });
                        const isTooSmallForText = productScale < 25;
                        const isNotHighlight = (focus && focus.mode === 'highlight' && focus.itemValue !== product)
                        return (
                            <g
                                transform={`translate(${0}, ${y})`}
                                onDoubleClick={() => setFocus({
                                    actionType: 'set',
                                    itemType: 'product',
                                    mode: 'filter',
                                    itemValue: product
                                })}
                                onClick={() => setFocus({
                                    actionType: 'set',
                                    itemType: 'product',
                                    mode: 'highlight',
                                    itemValue: product
                                })}
                                key={i}
                            >
                                <rect
                                    x={0}
                                    y={0}
                                    width={barWidth}
                                    height={productScale}
                                    fill={color}
                                    opacity={(isNotHighlight ? 0.2 : 1)}
                                />
                                {(isTooSmallForText === false || isNotHighlight === false) &&
                                    <text
                                        y={productScale - labelMargin}
                                        x={labelMargin}
                                        fontSize={10}
                                    >{product}</text>
                                }
                            </g>
                        )
                    })
                }
            </AnimatedGroup>
            <AnimatedGroup
                className="partner-bar"
                transform={`translate(${width / 2 - barWidth / 2}, ${productBarHeight + centerCircleHeight})`}
            >
                {
                    partnersDraw.map(([partner, y], i) => {
                        y = scaleValue(y);
                        const partnerScale = scaleValue(partnersMaxValue[partner]);
                        const color = colorPalette[partner] || iwanthue(1, { seed: partner });
                        return (
                            <g
                                transform={`translate(${0}, ${y})`}
                                key={i}
                                onDoubleClick={() => setFocus({
                                    actionType: 'set',
                                    itemType: 'partner',
                                    mode: 'filter',
                                    itemValue: partner
                                })}
                                onClick={() => setFocus({
                                    actionType: 'set',
                                    itemType: 'partner',
                                    mode: 'highlight',
                                    itemValue: partner
                                })}
                            >
                                <rect
                                    x={0}
                                    y={0}
                                    width={barWidth}
                                    height={partnerScale}
                                    fill={color}
                                />
                                {
                                    partner !== 'Fraude' &&
                                    <text
                                        y={partnerScale - labelMargin}
                                        x={labelMargin}
                                        fontSize={10}
                                    >{partner}</text>
                                }
                            </g>
                        )
                    })
                }
            </AnimatedGroup>
            <g>
                {
                    links['Imports'].map(({ from, to, value, product, isFraude, isHighlight }, i) => {
                        const color = colorPalette[product] || iwanthue(1, { seed: product });
                        const strokeWidth = scaleValue(value);
                        const strokeWidthMiddle = strokeWidth / 2;
                        const isTooSmallForText = strokeWidth < 25;
                        return (
                            <g
                                transform={`translate(${width / 2 - barWidth / 2}, ${to.y + strokeWidthMiddle})`}
                                key={i}
                                style={{
                                    mixBlendMode: 'multiply'
                                }}
                            >
                                <AnimatedPath
                                    d={
                                        isFraude ?
                                            `
                                            M ${0} ${0}
                                            L ${width} ${0}
                                            `
                                            :
                                            partialCirclePathD(
                                                0,
                                                (height - (to.y) - (partnerBarHeight - from.y)) / 2,
                                                (height - (to.y) - (partnerBarHeight - from.y)) / 2,
                                                Math.PI / 2,
                                                Math.PI * 3 / 2,
                                            )
                                    }
                                    strokeWidth={strokeWidth}
                                    stroke={color}
                                    fill='transparent'
                                    opacity={(focus && focus.mode === 'highlight' && isHighlight === false ? 0.2 : 1)}
                                />
                                {isTooSmallForText === false && <text textAnchor='end'>{formatNumber(value)}</text>}
                            </g>
                        )
                    })
                }
                {
                    links['Exports'].map(({ from, to, value, product, isFraude, isHighlight }, i) => {
                        const color = colorPalette[product] || iwanthue(1, { seed: product });
                        const strokeWidth = scaleValue(value);
                        const strokeWidthMiddle = strokeWidth / 2;
                        const isTooSmallForText = strokeWidth < 25;
                        return (
                            <g
                                transform={`translate(${width / 2 + barWidth / 2}, ${from.y + strokeWidthMiddle})`}
                                key={i}
                                style={{
                                    mixBlendMode: 'multiply'
                                }}
                            >
                                <AnimatedPath
                                    transform='scale(-1, 1)'
                                    d={
                                        isFraude ?
                                            `
                                            M ${0} ${0}
                                            L -${width} ${0}
                                            `
                                            :
                                            partialCirclePathD(
                                                0,
                                                (height - (from.y) - (partnerBarHeight - to.y)) / 2,
                                                (height - (from.y) - (partnerBarHeight - to.y)) / 2,
                                                Math.PI / 2,
                                                Math.PI * 3 / 2,
                                            )
                                    }
                                    strokeWidth={strokeWidth}
                                    stroke={color}
                                    fill='transparent'
                                    opacity={(focus && focus.mode === 'highlight' && isHighlight === false ? 0.2 : 1)}
                                />
                                {isTooSmallForText === false && <text textAnchor='start'>{formatNumber(value)}</text>}
                            </g>
                        )
                    })
                }
            </g>
            <g
                className="center-circle"
                transform={`translate(${width / 2 - barWidth / 2}, ${productBarHeight})`}
            >
                <g
                    transform={`translate(${0}, ${centerCircleHeight / 2})`}
                >
                    <path
                        d={partialCirclePathD(
                            0,
                            0,
                            centerCircleHeight / 2,
                            Math.PI / 2,
                            Math.PI * 3 / 2,
                        )}
                        strokeWidth={2}
                        stroke='black'
                        fill='transparent'
                        markerEnd='url(#arrow-head)'
                    />
                    <text x={-30} textAnchor='end'>Imports</text>
                </g>
                <g
                    transform={`translate(${barWidth}, ${centerCircleHeight / 2})`}
                >
                    <path
                        d={partialCirclePathD(
                            0,
                            0,
                            centerCircleHeight / 2,
                            Math.PI / 2,
                            Math.PI * 3 / 2,
                        )}
                        strokeWidth={2}
                        stroke='black'
                        fill='transparent'
                        markerEnd='url(#arrow-head)'
                        transform='rotate(180)'
                    />
                    <text x={30} textAnchor='start'>Exports</text>
                </g>
            </g>
        </svg>
    )
}