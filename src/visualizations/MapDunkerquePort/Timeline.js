import React, { useContext, useMemo, useRef } from "react";

import TimelineFragment from "./TimelineFragment";

import { scaleLinear } from "d3-scale";
import { range } from "lodash";
import { generatePalette } from "../../utils/misc";
import { VisualisationContext } from "../../utils/contexts";

export default function Timeline({
    data,
    dimensions,
    ...props
}) {
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

    const yearsOnInterest = useMemo(() => {
        const paylaod = {};
        for (const { year, category, text, ...rest } of data) {
            paylaod[year] = {
                color: categoriesColor[category],
                ...rest
            }
        }
        return paylaod;
    }, [data, categoriesColor]);

    const spanRange = useMemo(() => {
        let yearMin = years[0], yearMax = years[years.length - 1];
        return scaleLinear()
            .domain([yearMin, yearMax])
            .range([0, timelineWidth]);
    }, [years, dimensions]);

    const step = useMemo(() => {
        return spanRange(years[1])
    }, [spanRange]);

    function getCoordinatesOnClick(e) {
        const { clientX, clientY } = e;
        const { top, left } = svgRef.current.getBoundingClientRect();
        return {
            x: clientX - left,
            y: clientY - top
        }
    }

    function changeYearOnClick(xCoordinateOnLick) {
        const floatYearForXCoordinate = spanRange.invert(xCoordinateOnLick);
        const yearForXCoordinate = Math.round(floatYearForXCoordinate);
        const years = Object.keys(yearsOnInterest);
        const yearClosest = years.reduce((prev, curr) => {
            return (Math.abs(curr - yearForXCoordinate) < Math.abs(prev - yearForXCoordinate) ? curr : prev);
        });
        const [year, { id: yearClosestId }] = Object.entries(yearsOnInterest).find(([year, metas]) => yearClosest === year)
        changeMapView(yearClosestId);
    }

    return (
        <svg
            ref={svgRef}
            onClick={(e) => {
                const { x } = getCoordinatesOnClick(e);
                changeYearOnClick(x);
            }}
            width={timelineWidth}
            height={timelineHeight}
        >
            {
                Object.entries(yearsOnInterest).map(([year, { ...rest }], i) => {
                    return (
                        <TimelineFragment
                            key={year}
                            width={step}
                            height={timelineHeight}
                            x={spanRange(year)}
                            y={0}
                            label={year}
                            { ...rest }
                        />
                    )
                })
            }
        </svg>
    )
}