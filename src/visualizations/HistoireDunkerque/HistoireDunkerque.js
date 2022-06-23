import React, { useMemo, useState } from "react";
import iwanthue from "iwanthue";

import DunkerqueMap from "./DunkerqueMap";
import Timeline from "./Timeline";
import MapPoints from "./MapPoints";

import './HistoireDunkerque.scss';

/**
 * 
 * @param {Object} props
 * @param {Object[]} props.data
 * @param {Object} props.dimensions
 * @param {Number} props.dimensions.width
 * @param {Number} props.dimensions.height
 * @param {Object} props.callerProps
 * @param {String} props.callerProps.year
 * @param {Object} props.callerProps.object
 * @returns 
 */

export default function HistoireDunkerque({
    data: inputData,
    dimensions,
    callerProps,
    ...props
}) {
    const { width, height } = dimensions;
    const imgBasePath = `${process.env.BASE_PATH}/assets/`;
    const timelineHeight = 50;
    const asideWidth = 50;

    const palette = {
        'tax-free': 'url(#diag-hatch)',
        'Spain': '#f5f697',
        'France': '#2F2D8D',
        'UK': '#a187d1'
    }

    const [diplayedYear, setDiplayedYear] = useState(1795);

    const data = useMemo(function computeDataYears() {
        return inputData.get('histoire-dunkerque-dates.csv').map((row, i) => {
            const { year_start, year_end } = row;

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
                    year: +year_start,
                }
            }
        })
    }, [inputData]);

    const events = data.filter(({ type }) => type === 'event').sort(({ year: aYear }, { year: bYear }) => {
        if (aYear < bYear) { return -1; }
        if (aYear > bYear) { return 1; }
        return 0;
    });
    const periods = data.filter(({ type }) => type === 'period');

    const {
        dunkerqueLayer,
        file_legend,
        file_head
    } = useMemo(function getDispleyForCurrentYear() {
        let lastEvent = events.find(({ year }) => year === diplayedYear);
        if (lastEvent === undefined) {
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                if (diplayedYear < event['year']) { break; }
                lastEvent = event;
            }
        }
        if (lastEvent === undefined) {
            lastEvent = events[0];
        }
        const { file_legend, file_head } = lastEvent;
        for (const period of periods) {
            const {
                year_start,
                year_end,
                dunkerque_city,
                dunkerque_territory,
                country,
                upper_town,
                lower_town
            } = period;
            if (year_start <= diplayedYear && year_end > diplayedYear) {
                return {
                    dunkerqueLayer: {
                        upperTown: dunkerque_city === '1' && upper_town === 'tax-free' ? 'red' : 'transparent',
                        lowerTown: dunkerque_city === '1' && lower_town === 'tax-free' ? 'red' : 'transparent',
                        dunkerqueTerritory: dunkerque_territory === '1' ? palette[upper_town] : 'transparent',
                        country: country === '1' ? palette['France'] : 'transparent',
                    },
                    file_legend,
                    file_head
                }
            }
        }
        return {};
    }, [diplayedYear, data])

    return (
        <div
            className='HistoireDunkerque'
            style={{
                width,
                height
            }}
        >
            <div
                className="top-section"
                style={{
                    width,
                    height: height - timelineHeight
                }}
            >
                <div
                    className='map-aside'
                    style={{
                        height: height - timelineHeight
                    }}
                >
                    <img
                        src={imgBasePath + file_head}
                    />
                    <img
                        src={imgBasePath + file_legend}
                    />
                </div>
                <div
                    className="map-main map-container"
                    style={{
                        width: width - asideWidth,
                        height: height - timelineHeight
                    }}
                >
                    <div
                        className='layer'
                        style={{ zIndex: 200 }}
                    >
                        <MapPoints
                            height={height - timelineHeight}
                            data={inputData.get('histoire-dunkerque-points.csv')}
                            diplayedYear={diplayedYear}
                        />
                    </div>
                    <div
                        className='layer'
                        style={{ zIndex: 100 }}
                    >
                        <DunkerqueMap
                            dimensions={{
                                width: width - asideWidth,
                                height: height - timelineHeight
                            }}
                            elementsDisplay={dunkerqueLayer}
                        />
                    </div>
                    <img
                        className='base'
                        src={imgBasePath + 'dunkerque_map.jpg'}
                    />
                </div>
            </div>
            <footer className="timeline">
                <Timeline
                    dimensions={{
                        width,
                        height: timelineHeight
                    }}
                    palette={palette}
                    data={data}
                    yearState={[diplayedYear, setDiplayedYear]}
                />
            </footer>
        </div>
    )
}