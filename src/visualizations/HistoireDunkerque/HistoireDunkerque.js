import React, { useEffect, useMemo, useRef, useState } from "react";

import DunkerqueMap from "./DunkerqueMap";
import Timeline from "./Timeline";
import MapPoints from "./MapPoints";
import MapLegend from "./MapLegend";

import './HistoireDunkerque.scss';
import translate from "../../utils/translate";
import cx from "classnames";

/**
 * 
 * @param {Object} props
 * @param {Object[]} props.data
 * @param {Object} props.dimensions
 * @param {Number} props.dimensions.width
 * @param {Number} props.dimensions.height
 * @param {Object} props.callerProps
 * @param {Number} props.callerProps.year
 * @returns 
 */

export default function HistoireDunkerque({
    data: inputData,
    dimensions,
    lang,
    callerProps,
    ...props
}) {
    const { width, height } = dimensions;
    const imgBasePath = `${process.env.BASE_PATH}/assets/`;

    const minTimelineHeight = 50;
    const maxTopSectionHeight = width - 250;
    const mediumBreakpoint = 600;

    const [showTimline, setShowTimeline] = useState(true);
    const [minMode, setMinMode] = useState(false);
    const [topSectionHeight, setTopSectionHeight] = useState(undefined);

    const mapContainerRef = useRef(null);

    const palette = {
        'tax-free': 'url(#diag-hatch)',
        'Spain': '#f5f697',
        'France': '#2F2D8D',
        'UK': '#a187d1',
        'point-port': '#ff493b',
        'point-kingdom': '#0d0a47'
    }

    useEffect(function responsive() {
        if (width === -1) { return; }
        console.log(width, minMode);
        setMinMode(width <= mediumBreakpoint);
        setShowTimeline(minMode === false);

        if (height - maxTopSectionHeight > minTimelineHeight) {
            setTopSectionHeight(maxTopSectionHeight);
        } else {
            setTopSectionHeight(height - minTimelineHeight);
        }
    }, [width, height, minMode]);

    const [diplayedYear, setDiplayedYear] = useState(callerProps?.year || inputData.get('histoire-dunkerque-dates.csv')[0]['year_start']);

    const data = useMemo(function computeDataYears() {
        return inputData.get('histoire-dunkerque-dates.csv').map((row, i) => {
            const { year_start, year_end } = row;

            row['head'] = row[`head_${lang}`];

            if (year_start && year_end) {
                return {
                    ...row,
                    type: 'period',
                    year_start: +year_start,
                    year_end: +year_end
                }
            }
            if (year_start) {
                return {
                    ...row,
                    type: 'event',
                    year_start: +year_start,
                    year_end: undefined
                }
            }
        })
    }, [inputData]);

    const events = data.filter(({ type }) => type === 'event').sort(({ year_start: aYear }, { year_start: bYear }) => {
        if (aYear < bYear) { return -1; }
        if (aYear > bYear) { return 1; }
        return 0;
    });
    const periods = data.filter(({ type }) => type === 'period');

    const {
        dunkerqueLayer,
        legend,
        head,
        previouseEvent,
        nextEvent
    } = useMemo(function getDisplayForCurrentYear() {
        let currentPeriod = periods.find((period) => {
            if (period['year_start'] <= diplayedYear && period['year_end'] > diplayedYear) {
                return true;
            }
        });
        let currentEvent = events.find((event) => {
            if (event['year_start'] === diplayedYear) {
                return true;
            }
        });

        let previouseEvent, nextEvent;
        for (const { year_start } of events) {
            if (year_start < diplayedYear) {
                previouseEvent = year_start;
                continue;
            }
            if (year_start > diplayedYear) {
                nextEvent = year_start;
                break;
            }
        }

        const reference = currentEvent || currentPeriod;
        const {
            dunkerque_city,
            dunkerque_territory,
            country,
            upper_town,
            lower_town,
            head,
            legend_square_port_free,
            legend_square_kingdom_france,
            legend_point_port_interests,
            legend_point_guard,
            legend_point_kingdom_dependency
        } = reference;

        return {
            dunkerqueLayer: {
                upperTown: dunkerque_city === '1' && upper_town === 'tax-free' ? 'red' : 'transparent',
                lowerTown: dunkerque_city === '1' && lower_town === 'tax-free' ? 'red' : 'transparent',
                dunkerqueTerritory: dunkerque_territory === '1' ? palette[upper_town] : 'transparent',
                country: country === '1' ? palette['France'] : 'transparent',
            },
            legend: {
                legend_square_port_free: (legend_square_port_free === '1'),
                legend_square_kingdom_france: (legend_square_kingdom_france === '1'),
                legend_point_port_interests: (legend_point_port_interests === '1'),
                legend_point_guard: (legend_point_guard === '1'),
                legend_point_kingdom_dependency: (legend_point_kingdom_dependency === '1')
            },
            head,
            previouseEvent,
            nextEvent
        }
    }, [diplayedYear, data]);

    return (
        <div
            className={cx('HistoireDunkerque', { minMode })}
            style={{
                width,
                height: minMode === false ? height : null
            }}
        >
            <div
                className="top-section"
                style={{
                    width,
                    // maxHeight: maxTopSectionHeight,
                    height: minMode === false ? topSectionHeight : null
                }}
            >
                <div className="map-title">
                    <div className="map-titles">
                        <span
                            className='map-switch-spans'
                            style={{ visibility: (!!previouseEvent) ? 'visible' : 'hidden' }}
                            onClick={(e) => { if (previouseEvent) { setDiplayedYear(previouseEvent); } }}
                        >??? {previouseEvent || '0000'}</span>
                        <h3>{diplayedYear}</h3>
                        <span
                            className='map-switch-spans'
                            style={{ visibility: (!!nextEvent) ? 'visible' : 'hidden' }}
                            onClick={(e) => { if (nextEvent) { setDiplayedYear(nextEvent); } }}
                        >{nextEvent || '0000'} ???</span>
                    </div>
                    <div className="head">{head}</div>
                    <div className="map-switch-btns">
                        <button
                            onClick={(e) => { if (previouseEvent) { setDiplayedYear(previouseEvent); } }}
                            style={{ visibility: (!!previouseEvent) ? 'visible' : 'hidden' }}
                        >{translate('HistoireDunkerque', 'btn_previous_step', lang)}</button>
                        <button
                            onClick={(e) => { if (nextEvent) { setDiplayedYear(nextEvent); } }}
                            style={{ visibility: (!!nextEvent) ? 'visible' : 'hidden' }}
                        >{translate('HistoireDunkerque', 'btn_next_step', lang)}</button>
                    </div>
                </div>

                <div
                    className="map-container"
                    ref={mapContainerRef}
                    style={{
                        width: minMode === false ? topSectionHeight : null,
                        height: minMode === false ? topSectionHeight : null
                    }}
                >
                    <div
                        className='layer'
                        style={{ zIndex: 200 }}
                    >
                        <MapPoints
                            {...{ lang, palette }}
                            data={inputData.get('histoire-dunkerque-points.csv')}
                            diplayedYear={diplayedYear}
                        />
                    </div>
                    <div
                        className='layer'
                        style={{ zIndex: 100 }}
                    >
                        <DunkerqueMap
                            elementsDisplay={dunkerqueLayer}
                        />
                    </div>
                    <img
                        className='base'
                        src={imgBasePath + 'dunkerque_map.jpg'}
                    />
                </div>

                <div className="map-legend">
                    <MapLegend
                        {...{ lang, palette }}
                        height={120}
                        width={190}
                        values={legend}
                    />
                </div>
            </div>

            {
                showTimline &&
                <footer
                    className="timeline"
                    style={{
                        height: height - topSectionHeight
                    }}
                >
                    <Timeline
                        dimensions={{
                            width,
                            height: height - topSectionHeight
                        }}
                        palette={palette}
                        data={data}
                        yearState={[diplayedYear, setDiplayedYear]}
                    />
                </footer>
            }
        </div>
    )
}