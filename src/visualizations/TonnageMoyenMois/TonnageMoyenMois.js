import { extent, group, groups, mean, max } from 'd3-array';
import React, { useEffect, useMemo, useState } from 'react';

import LineChart from '../../components/LineChart';
import { formatNumber } from '../../utils/misc';
import translate from '../../utils/translate';
import Timeline from './Timeline';

import './TonnageMoyenMois.scss';

const MONTH_MAP_EN = {
  'Janvier': 'January',
  'Février': 'February',
  'Mars': 'March',
  'Avril': 'April',
  'Mai': 'May',
  'Juin': 'June',
  'Juillet': 'Jully',
  'Août': 'August',
  'Septembre': 'September',
  'Octobre': 'October',
  'Novembre': 'November',
  'Décembre': 'December',
}

export default function TonnageMoyenMois({
    data: inputData,
    dimensions,
    lang,
    callerProps: {
      debut,
      fin
    } = {},
    ...props
}) {
    const [minYear, maxYear] = extent(inputData, d => d.year)
    const { width, height } = dimensions;
    const [yearBrush, setYearBrush] = useState([minYear, minYear]);

    useEffect(() => {
      setYearBrush([debut || minYear, fin || maxYear]);
    }, [debut, fin])

    const data = useMemo(() => {
        return inputData
        .filter(({ year: rowYear }) => yearBrush.includes(rowYear))
        .map(({ value, month, ...rest }) => {
            return {
                ...rest,
                value: +value,
                month: lang === 'fr' ? month : MONTH_MAP_EN[month]
            }
        })
    }, [inputData, yearBrush, lang]);

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
    }, [height]);

    const margins = {
      left: 80,
      right: 30,
    }

    return (
        <div className="TonnageMoyenMois">
            <LineChart
                data={monthsValue}
                x={{
                    field: 'value',
                    title: translate('TonnageMoyenMois', 'x', lang),
                    tickSpan: width > 600 ? 1000 : 5000,
                    tickFormat: (value, valueIndex) => formatNumber(value, lang) + (lang === 'fr' ? ' tx' : ' b'),
                    domain: [0, max(monthsValue.map(d => d.value))]
                }}
                y={{
                    field: 'month',
                    title: translate('TonnageMoyenMois', 'y', lang),
                    fillGaps: true,
                    type: 'ordinal'
                }}
                width={width}
                height={linechartHeight}
                margins={margins}
                tooltip={
                    (d) => translate('TonnageMoyenMois', 'tooltip', lang, {
                        value: formatNumber(Math.round(d['value']), lang),
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
                margins={margins}
                yearBrushState={[yearBrush, setYearBrush]}
                lang={lang}
            />
        </div>
    )
}