import React, { useContext, useMemo, useRef, useState, useEffect } from "react";

import TimelineFragment from "./TimelineFragment";

import { scaleLinear } from "d3-scale";
import { range } from "lodash";
import { generatePalette } from "../../utils/misc";
import { VisualisationContext } from "../../utils/contexts";

export default function Timeline({
    data,
    dimensions,
    callerProps,
    ...props
}) {
    const [yearMark, setYearMark] = useState(undefined);
    const { width: timelineWidth, height: timelineHeight } = dimensions;

    const svgRef = useRef(null);

    const {
        changeMapView
    } = useContext(VisualisationContext);

    const years = useMemo(() => {
        let yearMin = Infinity, yearMax = 0;
        for (const { year } of data) {
            if (year < yearMin) { yearMin = +year }
            if (year > yearMax) { yearMax = +year }
        }
        return range(yearMin, yearMax);
    }, [data]);

    const categoriesColor = useMemo(() => {
        let categories = new Set(data.map(({category}) => category));
        categories = Array.from(categories);
        const colors = generatePalette('years', categories.length);
        categories = categories.map((category, i) => [category, colors[i]]);
        categories = Object.fromEntries(categories)
        return categories;
    }, [data]);

    const categories = useMemo(() => {
        return Object.keys(categoriesColor);
    }, [categoriesColor])

    const categoryHeight = useMemo(() => {
        return timelineHeight / categories.length;
    }, [categories, timelineHeight])

    const yearsOnInterest = useMemo(() => {
        // const yearFromData = new Set(data.map(({ year }) => year))
        // return Array.from(yearFromData);
        const paylaod = {};
        for (const { year, ...rest } of data) {
            const { category } = rest;
            paylaod[year] = {
                color: categoriesColor[category],
                ...rest
            }
        }
        return paylaod;
    }, [data]);

    const spanRange = useMemo(() => {
        let yearMin = years[0], yearMax = years[years.length - 1];
        return scaleLinear()
            .domain([yearMin, yearMax])
            .range([0, timelineWidth]);
    }, [years, dimensions]);

    const step = useMemo(() => {
        return spanRange(years[1])
    }, [spanRange]);

    // useEffect(() => {
    //     const { year: callerYear, object: callerObject } = callerProps;
    //     if (callerYear === undefined) { return; }
    //     const itemFromCaller = data.find(({ year: rowYear, object: rowObject }) => {
    //         if (rowYear === callerYear && object === undefined) {
    //             return true;
    //         }
    //         if (rowYear === callerYear && rowObject === callerObject) {
    //             return true;
    //         }
    //     })
    //     const { year } = itemFromCaller;
    //     console.log(spanRange(year));
    // }, [callerProps])

    function getCoordinatesOnClick(e) {
        const { clientX, clientY } = e;
        const { top, left } = svgRef.current.getBoundingClientRect();
        return {
            x: clientX - left,
            y: clientY - top
        }
    }

    function getYearWithX(xCoordinateOnLick) {
        const floatYearForXCoordinate = spanRange.invert(xCoordinateOnLick);
        const yearForXCoordinate = Math.round(floatYearForXCoordinate);
        return yearForXCoordinate;
    }

    function getInterestYearIdWithX(xCoordinateOnLick) {
        let yearTarget = getYearWithX(xCoordinateOnLick);
        const years = Object.keys(yearsOnInterest);
        const yearClosest = years.reduce((prev, curr) => {
            return (Math.abs(curr - yearTarget) < Math.abs(prev - yearTarget) ? curr : prev);
        });
        const [_, { id: yearClosestId }] = Object.entries(yearsOnInterest).find(([year, {...rest}]) => yearClosest === year)
        return yearClosestId;
    }

    return (
        <svg
            ref={svgRef}
            onClick={(e) => {
                const { x } = getCoordinatesOnClick(e);
                let yearClosestId = getInterestYearIdWithX(x);
                changeMapView(yearClosestId);
            }}
            onMouseMove={(e) => {
                const { x } = getCoordinatesOnClick(e);
                let yearTarget = getYearWithX(x);
                setYearMark({
                    year: yearTarget,
                    x
                })
            }}
            onMouseLeave={() => setYearMark(undefined)}
            width={timelineWidth}
            height={timelineHeight}
        >
            {
                years.map((year, i) => {
                    if (year % 20 !== 0) {
                        return null;
                    }
                    return (
                        <g
                            transform={`translate(${spanRange(year)}, ${0})`}
                            key={i}
                        >
                            <line
                                y1={timelineHeight}
                                y2={0}
                                strokeOpacity="0.2"
                                strokeDasharray="10,15"
                                stroke='gray'
                                strokeWidth={1}
                            ></line>
                            <text y={timelineHeight} x={5} fontSize={10} fill='gray'>{year}</text>
                        </g>
                    )
                })
            }
            {
                yearMark &&
                <g
                    transform={`translate(${yearMark.x}, ${0})`}
                >
                    <line
                        y1={timelineHeight}
                        y2={0}
                        stroke='black'
                        strokeWidth={step}
                    ></line>
                    <text y={timelineHeight} x={5} fontSize={10}>{yearMark.year}</text>
                </g>
            }
            {
                categories.map((category, i) => {
                    const categoryLabelSize = 14;
                    const categoryLabelMargin = 5;
                    return (
                        <g
                            key={i}
                            transform={`translate(${0}, ${categoryHeight * i})`}
                        >
                            <text y={categoryLabelSize} fontSize={categoryLabelSize} >{category}</text>
                            {
                                data
                                .filter(({ category: yearCategory }) => yearCategory === category)
                                .map(({ year, year_end, ...rest }, i) => {
                                    const length = (year_end) ? year_end - year : 1;
                                    return (
                                        <TimelineFragment
                                            key={i}
                                            width={step*length}
                                            height={categoryHeight - categoryLabelSize}
                                            x={spanRange(year)}
                                            y={categoryLabelSize + categoryLabelMargin}
                                            label={year}
                                            color={categoriesColor[category]}
                                            { ...rest }
                                        />
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