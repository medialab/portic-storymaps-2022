import React, { useMemo, useState } from "react";

import { groups, sum, max } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import iwanthue from 'iwanthue';

import { AnimatedPath, AnimatedGroup, AnimatedText } from '../AnimatedSvgElements';
import { isEqual } from "lodash";

import './AlluvialChart.scss';

/**
 * @param {Object} props
 * @param {Object[]} props.data
 * @param {Array} props.steps ordered list of dimensions of the chart to link
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
  quantifierField,
  colorPalette = {},
}) {
  const { width, height } = dimensions;
  const [highlightedCategoryName, setHighlightedCategoryName] = useState(undefined);
  const [highlightedLinesId, setHighlightedLinesId] = useState(undefined);
  /**
   * We should to order steps as the 'steps' prop and sort
   * categories by their values
   */
  function sortCategories(a, b, step = {}) {
    const [aCategory, aCategoryArray] = a;
    const [bCategory, bCategoryArray] = b;
    const {
      sortType = 'length',
      sortField,
      sortOrder = 'ascending'
    } = step;

    let result = 0;
    if (sortType === 'alphabetical') {

      if (aCategory.toLowerCase() > bCategory.toLowerCase()) {
        result = 1;
      }
      result = -1;
    } else if (sortType === 'field' && sortField !== undefined) {
      const firstA = aCategoryArray.length ? aCategoryArray[0][sortField] : undefined;
      const firstB = bCategoryArray.length ? bCategoryArray[0][sortField] : undefined;
      if (firstA < firstB) {
        result = -1;
      }
      else {
        result = 1;
      }
    // default : length sorting
    } else {
      if (quantifierField) {
        const aWeightSum = aCategoryArray.reduce((sum, datum) => sum + +(datum[quantifierField]) , 0)
        const bWeightSum = bCategoryArray.reduce((sum, datum) => sum + +(datum[quantifierField]) , 0)
        if (aWeightSum< bWeightSum) {
          result = -1;
        }
        else if (aWeightSum > bWeightSum) {
          result = 1;
        }
      }else {
        if (aCategoryArray.length < bCategoryArray.length) {
          result = -1;
        }
        else if (aCategoryArray.length > bCategoryArray.length) {
          result = 1;
        }
      }
      
    }
    if (sortOrder === 'descending') {
      result = -result;
    }
    return result;
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
      const stepGroup = groups(data, row => row[step.field]);
      const stepGroupSorted = stepGroup
      .sort((a, b) => sortCategories(a, b, step));
      const stepGroupMap = new Map();
      for (const [category, categoryArray] of stepGroupSorted) {
        stepGroupMap.set(category, categoryArray)
      }
      payload.set(
        step.field,
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
      const category = stepsGroup.get(step.field);
      const stepItemsNbFromAllCategories = sum(category, d => {
        let localSize = d[1].length;
        if (quantifierField) {
          localSize = sum(d[1], datum => datum[quantifierField]);
        }
        return localSize
      });
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
   * We should link values between steps
   */
  const links = useMemo(function getLinksBetweenSteps() {
    const links = [];
    for (let iStep = steps.length - 1; iStep > 0; iStep--) {
      const step = steps[iStep];
      const previousStep = steps[iStep - 1];

      let iRow = 0;

      const categories = stepsGroup.get(step.field)
        .sort((a, b) => sortCategories(a, b, step))

      for (let iCategory = 0; iCategory < categories.length; iCategory++) {
        const [category, rows] = categories[iCategory];
        rows.sort((a, b) => { // group rows
          if (a[previousStep.field] < b[previousStep.field]) { return -1; }
          if (a[previousStep.field] > b[previousStep.field]) { return 1; }
          return 0;
        })
        // aggregate rows by steps
        let lastRow = undefined;
        for (const row of rows) {
          if (lastRow &&
            lastRow[step.field] === row[step.field] &&
            lastRow[previousStep.field] === row[previousStep.field]
          ) {
            const lastLink = links[links.length - 1];
            lastLink.length += 1;
            iRow++;
            continue;
          }
          links.push({
            from: row[previousStep.field],
            to: {
              category: row[step.field],
              y: iRow
            },
            length: 1,
            id: row.id,
            isHighlighted: highlightedLinesId && highlightedLinesId.has(row.id)
          })
          iRow++;
          lastRow = row;
        }
      }
    }
    return links
  }, [stepsGroup, steps, highlightedLinesId])

  return (
    <svg
      {...{ height, width }}
      viewBox={`0 0 ${width} ${height}`}
      className='AlluvialChart'
    >
      {
        steps.map(({ field: stepName, title: stepTitle, label: labelField }, iStep) => {
          let iItem = 0;
          const isHoverMode = highlightedCategoryName !== undefined;
          const nodeWidth = 10;
          const itemHeight = itemRange(1);
          const itemWidth = widthRange(1) - nodeWidth;
          const itemWidthMiddle = widthRange(1 / 2);
          const isFinalStep = iStep === steps.length - 1;
          const group = stepsGroup.get(stepName);
          const nextStep = steps[iStep + 1];
          const title = stepTitle || stepName;
          return (
            <AnimatedGroup
              transform={`translate(${widthRange(iStep)}, ${0})`}
              key={iStep}
              className="step"
            >
              <text
                className="step-title"
                y={height}
                x={isFinalStep ? 0 : 0}
                textAnchor={isFinalStep ? 'end' : 'start'}
              >
                {title}
              </text>

              {
                group.map(([categoryName, categoryArray], iCategory) => {
                  const isHighlighted = categoryName === highlightedCategoryName;
                  const categoryLinks = links.filter(({ from }) => from === categoryName);
                  const color = colorPalette[categoryName] || iwanthue(1, { seed: categoryName });
                  const linksLength = sum(categoryLinks, d => d.length);
                  const barHeight = itemRange(categoryArray.length);
                  const isTooSmallForText = barHeight < 10;
                  const label = labelField ? categoryArray[0][labelField] : categoryName;
                  // console.log(categoryName, highlightedCategoryName, isHighlighted)
                  // const isTooSmallForText = itemRange(linksLength) < 15;

                  const handleClick = (e) => {
                    e.stopPropagation();
                    if (highlightedCategoryName) {
                      setHighlightedCategoryName(undefined);
                    } else {
                      setHighlightedCategoryName(categoryName);
                    }
                    const linesId = new Set(categoryArray.map(({ id }) => id));
                    if (isEqual(highlightedLinesId, linesId)) {
                      setHighlightedLinesId(undefined);
                      return;
                    }
                    setHighlightedLinesId(linesId);
                  }
                  // labels on the left
                  if (isFinalStep) {
                    const text = (
                      <AnimatedGroup
                        transform={`translate(${0} ${itemRange(iItem)})`}
                        key={categoryName}
                        className={`category ${isHighlighted ? 'is-highlighted' : ''}`}
                        onClick={handleClick}
                      >
                        <rect
                          className="bar"
                          x={-nodeWidth}
                          y={0}
                          width={nodeWidth}
                          height={barHeight}
                          fill={color}
                          opacity={highlightedCategoryName && categoryName !== highlightedCategoryName ? .5 : 1}
                        />
                        <AnimatedText
                          className={`modality-label ${isTooSmallForText ? 'is-overflowing' : ''}`}
                          y={itemRange(categoryArray.length / 2) + 5}
                          x={-nodeWidth * 1.5}
                          textAnchor='end'
                        >
                          {label}
                        </AnimatedText>
                      </AnimatedGroup>
                    )

                    iItem += categoryArray.length;

                    return text;
                  }

                  // default : labels on the left
                  return (
                    <AnimatedGroup
                      key={categoryName}
                      className={`category ${isHighlighted ? 'is-highlighted' : ''}`}
                      onClick={handleClick}
                    >
                      <AnimatedGroup
                        transform={`translate(${0} ${itemRange(iItem)})`}
                      >
                        <rect
                          className="bar"
                          x={0}
                          y={0}
                          width={nodeWidth}
                          height={barHeight}
                          // fill={highlightedCategoryName && categoryName !== highlightedCategoryName ? 'grey' : 'black'}
                          fill={color}
                          opacity={highlightedCategoryName && categoryName !== highlightedCategoryName ? .5 : 1}
                        />
                        <AnimatedText
                          y={itemRange(linksLength) / 2 + 5}
                          x={nodeWidth * 1.5}
                          className={`modality-label ${isTooSmallForText ? 'is-overflowing' : ''}`}
                        >
                          {label}
                        </AnimatedText>
                      </AnimatedGroup>

                      {
                        categoryLinks.map(({ from, to, length, id, isHighlighted }, iCategoryItem) => {
                          const reduceOpacity = (isHoverMode && isHighlighted === false) || (highlightedLinesId && isHighlighted === false);
                          // path stroke grow from the middle of the path, we must balance coordinates by 'strokeWidth'
                          const middlePath = itemHeight * length / 2;
                          const curve = {
                            a1: `${itemWidthMiddle} ${itemRange(iItem) + middlePath}`,
                            b1: `${itemWidthMiddle} ${itemRange(to.y) + middlePath}`,
                            b: `${itemWidth} ${itemRange(to.y) + middlePath}`
                          }
                          links.filter(({ highlighted }) => highlighted === true);
                          const handleLinkClick = e => {
                            e.stopPropagation();
                            const linesId = new Set(categoryArray.filter((obj) => {
                              const thatTo = obj[nextStep.field];
                              return thatTo === to.category;
                            }).map(({ id }) => id));
                            if (isEqual(highlightedLinesId, linesId)) {
                              setHighlightedLinesId(undefined);
                              return;
                            }
                            setHighlightedLinesId(linesId);
                          }
                          const path = (
                            <AnimatedGroup
                              transform={`translate(${nodeWidth}, ${0})`}
                              style={{
                                mixBlendMode: 'multiply'
                              }}
                              key={`${from}-${to.category}`}
                              className="link"
                              onClick={handleLinkClick}
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
                    </AnimatedGroup>
                  )
                })
              }
            </AnimatedGroup>
          )
        })
      }
    </svg>
  )
}