import React, { useMemo } from "react";

import { groups, sum, max } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import iwanthue from 'iwanthue';

export default function AlluvialChart({
    data,
    steps,
    dimensions = { width: 800, height: 500 },
    decreasing = false
}) {
    const { width, height } = dimensions;
    /**
     * We should to order steps as the 'steps' prop and sort
     * categories by their values
     */
    const sortCategories = useMemo(function getSortFunction() {
        return (a, b) => {
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
    }, [decreasing])

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
    }, [data, sortCategories]);

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
            .range([0, height]);
    }, [steps, stepsGroup, height]);

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
                rows.forEach((row) => {
                    links.push({
                        from: row[previousStep],
                        to: {
                            category: row[step],
                            y: iRow
                        }
                    })
                    iRow++;
                })
            }
        }
        return links
    }, [stepsGroup, sortCategories, steps])

    return (
        <svg
            {...{ height, width }}
            style={{
                border: '2px solid whitesmoke'
            }}
        >
            {
                steps.map((stepName, iStep) => {
                    let iItem = 0;
                    const itemHeight = itemRange(1);
                    const itemWidth = widthRange(1);
                    const itemWidthMiddle = widthRange(1 / 2);
                    const isFinalStep = iStep === steps.length - 1;
                    return (
                        <g
                            transform={`translate(${widthRange(iStep)}, ${0})`}
                            key={iStep}
                        >
                            <line
                                y1={height}
                                y2={0}
                                stroke='black'
                                strokeWidth={1}
                            ></line>
                            <text
                                y={height}
                                x={isFinalStep ? -5 : 5}
                                fontSize={10}
                                fill='black'
                                textAnchor={isFinalStep ? 'end' : 'start'}
                            >{stepName}</text>

                            {
                                stepsGroup.get(stepName).map(([categoryName, categoryArray], iCategory) => {
                                    const categoryLinks = links.filter(({ from }) => from === categoryName)
                                    if (isFinalStep) {
                                        const text = (
                                            <g
                                                transform={`translate(${0} ${itemRange(iItem)})`}
                                                key={iCategory}
                                            >
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
                                    const color = iwanthue(1, { seed: categoryName })
                                    return (
                                        <g key={iCategory}>
                                            <g
                                                transform={`translate(${0} ${itemRange(iItem)})`}
                                            >
                                                <text
                                                    y={itemRange(categoryLinks.length / 2)}
                                                    x={5} fontSize={10} fontWeight='bold'
                                                    fill='black'
                                                >
                                                    {categoryName}
                                                </text>
                                            </g>

                                            {
                                                categoryLinks.map(({ to }, iCategoryItem) => {
                                                    const curve = {
                                                        topLine: {
                                                            a1: `${itemWidthMiddle} ${itemRange(iItem)}`,
                                                            b1: `${itemWidthMiddle} ${itemRange(to.y)}`,
                                                            b: `${itemWidth} ${itemRange(to.y)}`
                                                        },
                                                        bottomLine: {
                                                            b: `${itemWidthMiddle} ${itemRange(to.y + 1)}`,
                                                            b1: `${itemWidthMiddle} ${itemRange(iItem + 1)}`,
                                                            a1: `${0} ${itemRange(iItem + 1)}`
                                                        }
                                                    }
                                                    const path = (
                                                        <g
                                                            transform={`translate(0, ${itemHeight / 2})`}
                                                            style={{
                                                                mixBlendMode: 'multiply'
                                                            }}
                                                            key={iCategoryItem}
                                                        >
                                                            <path
                                                                d={`
                                                                M 0 ${itemRange(iItem)}
                                                                C ${curve.topLine.a1}, ${curve.topLine.b1}, ${curve.topLine.b}
                                                                `}
                                                                fill='transparent'
                                                                stroke={color}
                                                                strokeWidth={itemHeight}
                                                            ></path>
                                                        </g>
                                                    )

                                                    iItem++;

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