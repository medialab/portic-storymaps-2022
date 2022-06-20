import { group } from 'd3-array';
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
    const { width, height } = dimensions;
    const [yearBrush, setYearBrush] = useState(undefined);

    const data = useMemo(() => {
        return inputData
            .map(({ month, ...rest }) => {
                const mounths = Object.fromEntries([
                    'Janvier',
                    'Février',
                    'Mars',
                    'Avril',
                    'Mai',
                    'Juin',
                    'Juillet',
                    'Août',
                    'Septembre',
                    'Octobre',
                    'Novembre',
                    'Décembre'
                ].map((mounth, i) => [mounth, i + 1]))
                return {
                    month: mounths[month],
                    ...rest
                }
            })
    }, [inputData]);

    const years = useMemo(function groupYears() {
        const yearGroup = group(data, d => d.year);
        return Array.from(yearGroup.keys());
    }, [data]);

    useEffect(function setInitialYear() {
        setYearBrush([years[0]]);
    }, [years]);

    const {
        linechartHeight,
        timelineHeight
    } = useMemo(function assignHeightForVizElts () {
        return {
            timelineHeight: 80,
            linechartHeight: height - 80
        }
    }, [height])

    if (yearBrush === undefined) {
        return null;
    }

    return (
        <>
            <LineChart
                data={
                    data.filter(({ year: rowYear }) => yearBrush.includes(rowYear))
                        .map(({ month, ...rest }) => {
                            return {
                                month: new Date(rest.year, month),
                                ...rest
                            }
                        })
                }
                x={{
                    field: 'value',
                    title: translate('TonnageMoyenMois', 'x', lang)
                }}
                y={{
                    field: 'month',
                    title: translate('TonnageMoyenMois', 'y', lang),
                    fillGaps: true,
                    tickFormat: v => new Date(v).toLocaleDateString()
                }}
                width={width}
                height={linechartHeight}
                tooltip={
                    (d) => translate('TonnageMoyenMois', 'tooltip', lang, {
                        value: formatNumber(d['value']),
                        month: d['month'].toLocaleDateString()
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