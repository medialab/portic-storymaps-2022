import React, { useMemo, useState } from "react";

import { groups, sum, max } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import iwanthue from 'iwanthue';

import { AnimatedPath, AnimatedGroup } from '../AnimatedSvgElements';
import { isEqual } from "lodash";

/**
 * @param {Object} props
 * @param {Object[]} props.data
 * @param {Array} props.steps ordered list of dimensions of the chart to link
 * @param {Boolean} [props.decreasing=false]
 * @param {Object} props.dimensions
 * @param {Number} props.dimensions.width
 * @param {Number} props.dimensions.height
 * @returns
 * @example
 * ```
 * <AlluvialChart
 *  data={[
 *      { "destination": "France", "is_smoggleur": "oui" },
 *      { "destination": "France", "is_smoggleur": "non" },
 *      { "destination": "Espagne", "is_smoggleur": "oui" }
 *  ]}
 *  steps={['destination', 'is_smoggleur']}
 * />
 * ```
 */

export default function AlluvialChart({
    data: inputData,
    steps,
    dimensions = { width: 800, height: 500 },
    colorPalette = {},
    decreasing = false
}) {
    const { width, height } = dimensions;
    const [isHighlightedCategoryName, setIsHighlightedCategoryName] = useState(undefined);
    const [isHighlightedLinesId, setIsHighlightedLinesId] = useState(undefined);
    /**
     * We should to order steps as the 'steps' prop and sort
     * categories by their values
     */
    function sortCategories(a, b) {
        const [aCategory, aCategoryArray] = a;
        const [bCategory, bCategoryArray] = b;
        if (decreasing) {
            if (aCategoryArray.length < bCategoryArray.length) { return 1; }
            if (aCategoryArray.length > bCategoryArray.length) { return -1; }
        } else {
            if (aCategoryArray.length < bCategoryArray.length) { return -1; }
            if (aCategoryArray.length > bCategoryArray.length) { return 1; }
        }
        return 0;
    }

    const data = useMemo(function addIdToLines() {
        return inputData.map(({ ...rest }, i) => {
            return {
                id: i,
                ...rest
            }
        })
    }, [inputData]);

    /**
     * We should to group values as categories for each step to define what
     * are the categories for each one
     */
    const stepsGroup = useMemo(function groupEachDataRowBySteps() {
        const payload = new Map();
        for (const step of steps) {
            const stepGroup = groups(data, row => row[step]);
            const stepGroupSorted = stepGroup.sort(sortCategories);
            const stepGroupMap = new Map();
            for (const [category, categoryArray] of stepGroupSorted) {
                stepGroupMap.set(category, categoryArray)
            }
            payload.set(
                step,
                stepGroupSorted
            )
        }
        return payload;
    }, [data]);

    const {
        bodyHeight,
        footerHeight
    } = useMemo(function getHeightForChartElements() {
        return {
            bodyHeight: height - 20,
            footerHeight: 20
        }
    }, [height])

    /**
     * We should divide steps categories on height space
     */
    const itemRange = useMemo(function getScaleLinearForHeight() {
        const stepsItemsNb = [];
        for (const step of steps) {
            const category = stepsGroup.get(step);
            const stepItemsNbFromAllCategories = sum(category, d => d[1].length);
            stepsItemsNb.push(stepItemsNbFromAllCategories);
        }
        const stepsItemsNbMax = max(stepsItemsNb);
        return scaleLinear()
            .domain([0, stepsItemsNbMax])
            .range([0, bodyHeight]);
    }, [steps, stepsGroup, bodyHeight]);

    /**
     * We should know what is the with for each step as a column
     */
    const widthRange = useMemo(function getScaleLinearForWidth() {
        return scaleLinear()
            .domain([0, steps.length - 1]) // -1 because last step had not outputs, so last column would be empty
            .range([0, width]);
    }, [steps, width]);

    /**
     * We should link vlaues between steps
     */
    const links = useMemo(function getLinksBetweenSteps() {
        const links = [];
        for (let iStep = steps.length - 1; iStep >= 0; iStep--) {
            const step = steps[iStep];
            const previousStep = steps[iStep - 1];

            let iRow = 0;

            const categories = stepsGroup.get(step)
                .sort(sortCategories)

            for (let iCategory = 0; iCategory < categories.length; iCategory++) {
                const [category, rows] = categories[iCategory];
                rows.sort((a, b) => { // group rows
                    if (a[previousStep] < b[previousStep]) { return -1; }
                    if (a[previousStep] > b[previousStep]) { return 1; }
                    return 0;
                })
                // aggregate rows by steps
                let lastRow = undefined;
                for (const row of rows) {
                    if (lastRow &&
                        lastRow[step] === row[step] &&
                        lastRow[previousStep] === row[previousStep]
                    ) {
                        const lastLink = links[links.length - 1];
                        lastLink.length += 1;
                        iRow++;
                        continue;
                    }
                    links.push({
                        from: row[previousStep],
                        to: {
                            category: row[step],
                            y: iRow
                        },
                        length: 1,
                        isHighlighted: isHighlightedLinesId && isHighlightedLinesId.has(row['id'])
                    })
                    iRow++;
                    lastRow = row;
                }
            }
        }
        return links
    }, [stepsGroup, steps, isHighlightedLinesId])

    return (
        <svg
            {...{ height, width }}
        >
            {
                steps.map((stepName, iStep) => {
                    let iItem = 0;
                    const isHoverMode = isHighlightedCategoryName !== undefined;
                    const nodeWidth = 5;
                    const itemHeight = itemRange(1);
                    const itemWidth = widthRange(1) - nodeWidth;
                    const itemWidthMiddle = widthRange(1 / 2);
                    const isFinalStep = iStep === steps.length - 1;
                    return (
                        <g
                            transform={`translate(${widthRange(iStep)}, ${0})`}
                            key={iStep}
                        >
                            <text
                                y={height - 6}
                                x={isFinalStep ? -5 : 5}
                                fontSize={16}
                                fill='black'
                                textAnchor={isFinalStep ? 'end' : 'start'}
                            >{stepName}</text>

                            {
                                stepsGroup.get(stepName).map(([categoryName, categoryArray], iCategory) => {
                                    const isCategoryHover = categoryName === isHighlightedCategoryName;
                                    const categoryLinks = links.filter(({ from }) => from === categoryName);
                                    const color = colorPalette[categoryName] || iwanthue(1, { seed: categoryName });
                                    const linksLength = sum(categoryLinks, d => d.length);
                                    const isTooSmallForText = itemRange(linksLength) < 15;

                                    if (isFinalStep) {
                                        const text = (
                                            <g
                                                transform={`translate(${0} ${itemRange(iItem)})`}
                                                key={iCategory}
                                            >
                                                <rect
                                                    className="tto"
                                                    x={-nodeWidth}
                                                    y={0}
                                                    width={nodeWidth}
                                                    height={itemRange(categoryArray.length)}
                                                    fill={isHighlightedCategoryName && categoryName !== isHighlightedCategoryName ? 'grey' : 'black'}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isHighlightedCategoryName) { setIsHighlightedCategoryName(undefined); }
                                                        const linesId = new Set(categoryArray.map(({ id }) => id));
                                                        if (isEqual(isHighlightedLinesId, linesId)) {
                                                            setIsHighlightedLinesId(undefined);
                                                            return;
                                                        }
                                                        setIsHighlightedLinesId(linesId);
                                                    }}
                                                />
                                                <text
                                                    y={itemRange(categoryArray.length / 2)}
                                                    x={-5} fontSize={10} fontWeight='bold'
                                                    fill='black'
                                                    textAnchor='end'
                                                >
                                                    {categoryName}
                                                </text>
                                            </g>
                                        )

                                        iItem += categoryArray.length;

                                        return text;
                                    }

                                    return (
                                        <g
                                            key={iCategory}
                                            onClick={(e) => {
                                                if (isHighlightedLinesId) { setIsHighlightedLinesId(undefined); }
                                                if (categoryName === isHighlightedCategoryName) {
                                                    setIsHighlightedCategoryName(undefined);
                                                    return;
                                                }
                                                setIsHighlightedCategoryName(categoryName);
                                            }}
                                        >
                                            <g
                                                transform={`translate(${0} ${itemRange(iItem)})`}
                                            >
                                                <rect
                                                    x={0}
                                                    y={0}
                                                    width={nodeWidth}
                                                    height={itemRange(linksLength)}
                                                    fill={isHighlightedCategoryName && categoryName !== isHighlightedCategoryName ? 'grey' : 'black'}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isHighlightedCategoryName) { setIsHighlightedCategoryName(undefined); }
                                                        const linesId = new Set(categoryArray.map(({ id }) => id));
                                                        if (isEqual(isHighlightedLinesId, linesId)) {
                                                            setIsHighlightedLinesId(undefined);
                                                            return;
                                                        }
                                                        setIsHighlightedLinesId(linesId);
                                                    }}
                                                />
                                                {
                                                    (isTooSmallForText === false || isCategoryHover === true) &&
                                                    <text
                                                        y={itemRange(linksLength) / 2}
                                                        x={5 + nodeWidth} fontSize={10} fontWeight='bold'
                                                        fill='black'
                                                    >
                                                        {categoryName}
                                                    </text>
                                                }
                                            </g>

                                            {
                                                categoryLinks.map(({ to, length, isHighlighted }, iCategoryItem) => {
                                                    const reduceOpacity = (isHoverMode && isCategoryHover === false) || (isHighlightedLinesId && isHighlighted === false);
                                                    // path stroke grow from the middle of the path, we must balance coordinates by 'strokeWidth'
                                                    const middlePath = itemHeight * length / 2;
                                                    const curve = {
                                                        a1: `${itemWidthMiddle} ${itemRange(iItem) + middlePath}`,
                                                        b1: `${itemWidthMiddle} ${itemRange(to.y) + middlePath}`,
                                                        b: `${itemWidth} ${itemRange(to.y) + middlePath}`
                                                    }
                                                    links.filter(({ highlighted }) => highlighted === true)
                                                    const path = (
                                                        <AnimatedGroup
                                                            transform={`translate(${nodeWidth}, ${0})`}
                                                            style={{
                                                                mixBlendMode: 'multiply'
                                                            }}
                                                            key={iCategoryItem}
                                                        >
                                                            <AnimatedPath
                                                                d={`
                                                                M 0 ${itemRange(iItem) + middlePath}
                                                                C ${curve.a1}, ${curve.b1}, ${curve.b}
                                                                `}
                                                                fill='transparent'
                                                                stroke={color}
                                                                strokeWidth={itemHeight * length}
                                                                opacity={reduceOpacity ? 0.2 : 1}
                                                            ></AnimatedPath>
                                                        </AnimatedGroup>
                                                    )
                                                    iItem += length;

                                                    return path;
                                                })
                                            }
                                        </g>
                                    )
                                })
                            }
                        </g>
                    )
                })
            }
        </svg>
    )
}