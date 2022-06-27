import { extent, group, groups, mean } from 'd3-array';
import React, { useEffect, useMemo, useState } from 'react';

import LineChart from '../../components/LineChart';
import { formatNumber } from '../../utils/misc';
import translate from '../../utils/translate';
import Timeline from './Timeline';

export default function TonnageMoyenMois({
    data: inputData,
    dimensions,
    lang,
    ...props
}) {
    const [minYear, maxYear] = extent(inputData, d => d.year)
    const { width, height } = dimensions;
    const [yearBrush, setYearBrush] = useState([minYear, minYear]);

    const data = useMemo(() => {
        return inputData
        .filter(({ year: rowYear }) => yearBrush.includes(rowYear))
        .map(({ value, ...rest }) => {
            return {
                ...rest,
                value: +value
            }
        })
    }, [inputData, yearBrush]);

    const monthsValue = useMemo(function groupMonths() {
        const monthGroup = groups(data, d => d.month);
        const monthGroupValue = monthGroup.map(([month, monthArray]) => {
            return {
                month,
                value: mean(monthArray, d => d.value)
            }
        })
        return monthGroupValue;
    }, [data, yearBrush]);

    const years = useMemo(function groupYears() {
        const yearGroup = group(inputData, d => d.year);
        return Array.from(yearGroup.keys());
    }, [inputData]);

    const {
        linechartHeight,
        timelineHeight
    } = useMemo(function assignHeightForVizElts () {
        return {
            timelineHeight: 80,
            linechartHeight: height - 80
        }
    }, [height])

    return (
        <>
            <LineChart
                data={monthsValue}
                x={{
                    field: 'value',
                    title: translate('TonnageMoyenMois', 'x', lang),
                    tickFormat: (value, valueIndex) => formatNumber(value)
                }}
                y={{
                    field: 'month',
                    title: translate('TonnageMoyenMois', 'y', lang),
                    fillGaps: true,
                    type: 'ordinal'
                }}
                width={width}
                height={linechartHeight}
                tooltip={
                    (d) => translate('TonnageMoyenMois', 'tooltip', lang, {
                        value: formatNumber(Math.round(d['value'])),
                        month: d['month'],
                        period: (yearBrush[0] === yearBrush[1]) ? yearBrush[0] : extent(yearBrush).join('-')
                    })
                }
            />
            <Timeline
                dimensions={{
                    width: width,
                    height: timelineHeight
                }}
                years={years}
                yearBrushState={[yearBrush, setYearBrush]}
            />
        </>
    )
}