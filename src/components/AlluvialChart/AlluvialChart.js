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
  displayCounts,
  className = '',
}) {
  const { width, height } = dimensions;
  const [highlightedCategoryName, setHighlightedCategoryName] = useState(undefined);
  // const [highlightedLinesId, setHighlightedLinesId] = useState(undefined);
  const [highlightedLinkCategoryNames, setHighlightedLinkCategoryNames] = useState(undefined);

  const nodeWidth = 10;

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
        const aWeightSum = aCategoryArray.reduce((sum, datum) => sum + +(datum[quantifierField]), 0)
        const bWeightSum = bCategoryArray.reduce((sum, datum) => sum + +(datum[quantifierField]), 0)
        if (aWeightSum < bWeightSum) {
          result = -1;
        }
        else if (aWeightSum > bWeightSum) {
          result = 1;
        }
      } else {
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
  const stepsGroups = useMemo(function groupEachDataRowBySteps() {
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

  const getCategorySize = useMemo(function getCategorySize() {
    // quantifier > size = sum of row values
    if (quantifierField) {
      return (categoryArray) => sum(categoryArray, d => +d[quantifierField]);
    }
    // no quantifier > size = number of rows
    return (categoryArray) => categoryArray.length;
  }, [quantifierField])

  /**
   * We should divide steps categories on height space
   */
  const heightScale = useMemo(function getScaleLinearForHeight() {
    const stepsSizes = [];
    for (const step of steps) {
      const category = stepsGroups.get(step.field);
      const stepTotalSize = sum(category, d => {
        // let localSize = d[1].length;
        return getCategorySize(d[1])
        // if (quantifierField) {
        //   localSize = sum(d[1], datum => datum[quantifierField]);
        // }
        // return localSize
      });
      stepsSizes.push(stepTotalSize);
    }
    const stepsItemsNbMax = max(stepsSizes);
    return scaleLinear()
      .domain([0, stepsItemsNbMax])
      .range([0, bodyHeight]);
  }, [steps, stepsGroups, bodyHeight, getCategorySize]);

  /**
   * We should know what is the with for each step as a column
   */
  const xScale = useMemo(function getScaleLinearForWidth() {
    return scaleLinear()
      .domain([0, steps.length - 1]) // -1 because last step had not outputs, so last column would be empty
      .range([0, width]);
  }, [steps, width]);

  const computedSteps = useMemo(function computeSteps() {
    return steps.map(({ field: stepName, title: stepTitle, label: labelField }, iStep) => {
      // const isHoverMode = highlightedCategoryName !== undefined;
      // const nodeWidth = 10;
      // const itemHeight = heightScale(1);
      const x = xScale(iStep)
      // const isFinalStep = iStep === steps.length - 1;
      const group = stepsGroups.get(stepName);
      // const nextStep = steps[iStep + 1];
      const title = stepTitle || stepName;
      let yDisplace = 0;
      return {
        title,
        labelsPosition: iStep === steps.length - 1 ? 'left' : 'right',
        x,
        stepName,
        items: group.map(([categoryName, categoryArray]) => {
          // const isHighlighted = categoryName === highlightedCategoryName;
          // const categoryLinks = links.filter(({ from }) => from === categoryName);
          const color = colorPalette[categoryName] || iwanthue(1, { seed: categoryName });
          // const linksLength = sum(categoryLinks, d => d.length);
          const categorySize = getCategorySize(categoryArray);
          const barHeight = heightScale(categorySize);
          const isTooSmallForText = barHeight < 10;
          let label = labelField ? categoryArray[0][labelField] : categoryName;
          if (displayCounts) {
            label = `${label}${displayCounts(categorySize)}`
          }
          const result = {
            categoryName,
            rows: categoryArray,
            categorySize,
            label,
            y: yDisplace,
            barHeight,
            hideLabel: isTooSmallForText,
            color
          }
          yDisplace += barHeight;
          return result;
        })
      }
    });
  }, [steps, width, height, stepsGroups])

  /**
   * We should link values between steps
   */
  const computedLinks = useMemo(function computeLinks() {
    // not computing last step
    return computedSteps.slice(0, computedSteps.length - 1).reduce((allLinks, {

      // title,
      // labelsPosition,
      x,
      stepName,
      items,
    }, stepIndex) => {
      const { items: nextStepItems, x: nextStepX } = computedSteps[stepIndex + 1];
      // keys = next categories, values = next displaces
      const nextStepYDisplaces = nextStepItems.reduce((categoriesMap, {categoryName: nextCategoryName}) => ({
        ...categoriesMap,
        [nextCategoryName]: 0
      }), {})
      return items.reduce((linksFromThatItemToNextStep, item) => {
        const {
          categoryName,
          label,
          y,
          // barHeight,
          // hideLabel,
          color,
        } = item;
        let yDisplace = y;
        
        return nextStepItems.reduce((linksFromThatItemToThatNextItem, nextItem) => {
          const {
            rows: nextRows,
            categoryName: nextCategoryName,
            label: nextLabel,
            y: nextStepY
          } = nextItem;
          const matchingRows = nextRows.filter(datum => datum[stepName] === categoryName);
          const matchingRowsSize = getCategorySize(matchingRows);
          const matchingRowsHeight = heightScale(matchingRowsSize);
          yDisplace += matchingRowsHeight;
          nextStepYDisplaces[nextCategoryName] += matchingRowsHeight;
          return [
            ...linksFromThatItemToThatNextItem,
            {
              id: `from-${categoryName}-to-${nextCategoryName}`,
              pathWidth: matchingRowsHeight,
              labels: [label, nextLabel],
              color,
              from: {
                x: x + nodeWidth,
                y: yDisplace - matchingRowsHeight / 2,
                categoryName
              },
              to: {
                x: nextStepX,
                y: nextStepY + nextStepYDisplaces[nextCategoryName] - matchingRowsHeight / 2,
                categoryName: nextCategoryName,
              }
            }
          ];
        }, linksFromThatItemToNextStep)
      }, allLinks)
    }, [])
  }, [computedSteps, getCategorySize, heightScale]);


  const hasHighlights = highlightedCategoryName !== undefined || highlightedLinkCategoryNames !== undefined;
  return (
    <svg
      {...{ height, width }}
      viewBox={`0 0 ${width} ${height}`}
      className={`AlluvialChart ${className} ${hasHighlights ? 'has-highlights' : ''}`}
    >
      {
        computedLinks.map(({
          id,
          pathWidth,
          color,
          from: {
            x: x1,
            y: y1,
            categoryName: fromCategoryName
          },
          to: {
            x: x2,
            y: y2,
            categoryName: toCategoryName
          }
        }) => {
          // const reduceOpacity = (isHoverMode && isHighlighted === false) || (highlightedLinesId && isHighlighted === false);
          const isHighlighted = highlightedCategoryName ?
           [fromCategoryName, toCategoryName].includes(highlightedCategoryName) :
            highlightedLinkCategoryNames ?
            fromCategoryName === highlightedLinkCategoryNames[0] && toCategoryName === highlightedLinkCategoryNames[1]
            : false;
          const xMiddle = (x1 + x2) / 2;
          const handleLinkClick = e => {
            e.stopPropagation();
            if (highlightedLinkCategoryNames) {
              setHighlightedLinkCategoryNames();
              setHighlightedCategoryName();
            }
            else {
              setHighlightedCategoryName();
              setHighlightedLinkCategoryNames([fromCategoryName, toCategoryName]);
            }
          }
          return (
            <AnimatedGroup
              transform={`translate(${0}, ${0})`}
              
              key={id}
              id={id}
              className={`link ${isHighlighted ? 'is-highlighted' : ''}`}
              onClick={handleLinkClick}
            >
              <AnimatedPath
                d={`
                  M ${x1} ${y1}
                  C ${xMiddle} ${y1}, ${xMiddle} ${y2}, ${x2} ${y2}
                  `}
                fill='transparent'
                stroke={color}
                strokeWidth={pathWidth}
              ></AnimatedPath>
            </AnimatedGroup>
          )
        })
      }
      {
        computedSteps.map(({
          title,
          labelsPosition,
          x,
          stepName,
          items,
        }, iStep) => {
          return (
            <AnimatedGroup
              transform={`translate(${x}, ${0})`}
              key={iStep}
              className="step"
            >
              <text
                className="step-title"
                y={height}
                x={0}
                textAnchor={labelsPosition === 'left' ? 'end' : 'start'}
              >
                {title}
              </text>

              { // render step groups
                items.map(({
                  categoryName,
                  label,
                  y,
                  barHeight,
                  hideLabel,
                  color
                }, iCategory) => {
                  let isHighlighted = false;
                  if (highlightedCategoryName) {
                    if (categoryName === highlightedCategoryName) {
                      isHighlighted = true;
                    } else {
                      const relatedLink = computedLinks.find((link) => {
                        if (
                        (
                          link.from.categoryName === categoryName  && link.to.categoryName === highlightedCategoryName
                        )
                        || 
                        (
                          link.to.categoryName === categoryName  && link.from.categoryName === highlightedCategoryName
                        )
                        ) {
                          return true
                        }
                      });
                      if (relatedLink) {
                        isHighlighted = true;
                      }
                    }
                  } else if (highlightedLinkCategoryNames && highlightedLinkCategoryNames.includes(categoryName)) {
                    isHighlighted = true;
                  } 

                  const handleClick = (e) => {
                    e.stopPropagation();
                    if (highlightedCategoryName) {
                      setHighlightedLinkCategoryNames();
                      setHighlightedCategoryName(undefined);
                    } else {
                      setHighlightedLinkCategoryNames();
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
                  // if (isFinalStep) {
                  return (
                    <AnimatedGroup
                      transform={`translate(${0}, ${y})`}
                      key={categoryName}
                      className={`category ${isHighlighted ? 'is-highlighted' : ''}`}
                      onClick={handleClick}
                    >
                      <rect
                        className="bar"
                        x={labelsPosition === 'left' ? -nodeWidth : 0}
                        y={0}
                        width={nodeWidth}
                        height={barHeight}
                        fill={color}
                      />
                      <AnimatedText
                        className={`modality-label ${hideLabel ? 'is-overflowing' : ''}`}
                        y={barHeight / 2 + 5}
                        x={labelsPosition === 'left' ? -nodeWidth * 1.5 : nodeWidth * 1.5}
                        textAnchor={labelsPosition === 'left' ? 'end' : 'start'}
                      >
                        {label}
                      </AnimatedText>
                    </AnimatedGroup>
                  )
                })
              }
            </AnimatedGroup>
          )
        })
      }
    </svg >
  )
}