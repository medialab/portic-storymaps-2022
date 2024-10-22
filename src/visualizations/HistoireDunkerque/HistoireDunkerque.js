import React, { useEffect, useMemo, useRef, useState } from "react";
import cx from "classnames";
import ReactTooltip from "react-tooltip";

import DunkerqueMap from "./DunkerqueMap";
import Timeline from "./Timeline";
import MapPoints from "./MapPoints";
import MapLegend from "./MapLegend";
import MiniLinechart from "./MiniLinechart";

import translate from "../../utils/translate";

import './HistoireDunkerque.scss';

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
  callerProps = {},
  ...props
}) {
  const { width, height: initialHeight } = dimensions;
  const height = initialHeight;
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
    setMinMode(width <= mediumBreakpoint);
    setShowTimeline(minMode === false);

    if (height - maxTopSectionHeight > minTimelineHeight) {
      setTopSectionHeight(maxTopSectionHeight);
    } else {
      setTopSectionHeight(height - minTimelineHeight);
    }
  }, [width, height, minMode]);
  const assiseData = inputData.get('histoire-dunkerque-assise.csv');
  // console.log(callerProps)
  const {displayassises} = callerProps;
  const [displayedYear, setDisplayedYear] = useState(callerProps && callerProps.year ? +callerProps.year : inputData.get('histoire-dunkerque-dates.csv')[0]['year_start']);
  useEffect(() => {
    if (callerProps && callerProps.year) {
      setDisplayedYear(+callerProps.year);
    }
  }, [callerProps && callerProps.year])
  const [displayedYearDigits, setDisplayedYearDigits] = useState(displayedYear);

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
  }, [inputData, lang]);

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
    headYear,
    previousEvent,
    nextEvent
  } = useMemo(function getDisplayForCurrentYear() {
    let currentEventIndex;
    let currentPeriod = periods.find((period) => {
      if (period['year_start'] <= displayedYear && period['year_end'] > displayedYear) {
        return true;
      }
    });
    let currentEvent = events.find((event, index) => {
      if (event['year_start'] === displayedYear) {
        currentEventIndex = index;
        return true;
      }
    });
    let lastEvent;
    let headYear;
    if (!currentEvent) {
      lastEvent = events.reverse().find((event) => event['year_start'] < displayedYear);
      headYear = lastEvent && lastEvent.year_start;
    }

    let previousEvent, nextEvent;
    // for (const { year_start } of events) {
    //   if (previousEvent && nextEvent) break;
    //   if (year_start < displayedYear) {
    //     previousEvent = year_start;
    //     break;
    //   }
    //   else if (year_start > displayedYear) {
    //     nextEvent = year_start;
    //     break;
    //   }
    // }
    const nextEventObj = events
    .sort((a, b) => {
      if (a.year_start > b.year_start) {
        return 1;
      }
      return -1;
    })
    .find(d => d.year_start > displayedYear);
    if (nextEventObj) {
      nextEvent = nextEventObj.year_start;
    }
    const previousEventObj = events.reverse().find(d => d.year_start < displayedYear);
    if (previousEventObj) {
      previousEvent = previousEventObj.year_start;
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
      head: head || (lastEvent && lastEvent[`head_${lang}`]),
      // case of head from previous year
      headYear,
      previousEvent,
      nextEvent
    }
  }, [displayedYear, data]);

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  useEffect(() => {
    if (displayedYear === +displayedYearDigits) {
      return;
    }
    const gap = Math.abs(+displayedYearDigits - displayedYear);
    const transitionDuration = 2000 / gap;
    if (+displayedYearDigits < displayedYear) {
      for (let i = +displayedYearDigits + 1 ; i <= +displayedYear ; i++ ) {
        setTimeout(() => {
          setDisplayedYearDigits(i);
        }, transitionDuration)
      }
    } else {
      for (let i = +displayedYearDigits - 1 ; i >= +displayedYear ; i-- ) {
        setTimeout(() => {
          setDisplayedYearDigits(i);
        }, transitionDuration)
      }
    }
    
  }, [displayedYear])

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
        <div className="left-column">
          <div className="map-title">
            <div className="map-titles">
              <span
                className='map-switch-spans'
                style={{ visibility: (!!previousEvent) ? 'visible' : 'hidden' }}
                onClick={(e) => { if (previousEvent) { setDisplayedYear(previousEvent); } }}
              >← {previousEvent || '0000'}</span>
              <h3>{displayedYearDigits}</h3>
              <span
                className='map-switch-spans'
                style={{ visibility: (!!nextEvent) ? 'visible' : 'hidden' }}
                onClick={(e) => { if (nextEvent) { setDisplayedYear(nextEvent); } }}
              >{nextEvent || '0000'} →</span>
            </div>
            <div className={`head ${headYear ? 'is-past' : ''}`}>{headYear ? `${headYear}${lang === 'fr' ? ' ' : ''}: ` : ''}{head}</div>
          </div>

          {
            assiseData && displayassises !== undefined ?
            <div className="assises-container">
              <h3>{translate('HistoireDunkerque', 'assise_title', lang)}</h3>
              <MiniLinechart 
                data={assiseData} 
                width={topSectionHeight ? width - topSectionHeight : width - 200} 
                height={200}
                x={{
                  field: 'annee'
                }}
                y={{
                  field: 'assise'
                  // field: 'rapport_assise_recettes'
                }}
                lang={lang}
              />
            </div>
            : null
          }


          {
            minMode ?
              null :
              <div className="map-legend">
                <MapLegend
                  {...{ lang, palette }}
                  height={100}
                  width={190}
                  values={legend}
                />
              </div>
          }

          <div className="map-switch-btns">
            <button
              onClick={(e) => { if (previousEvent) { setDisplayedYear(previousEvent); } }}
              style={{ visibility: (!!previousEvent) ? 'visible' : 'hidden' }}
            >{translate('HistoireDunkerque', 'btn_previous_step', lang)}</button>
            <button
              onClick={(e) => { if (nextEvent) { setDisplayedYear(nextEvent); } }}
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
              displayedYear={displayedYear}
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
        {
          minMode ?
            <div className="map-legend">
              <MapLegend
                {...{ lang, palette }}
                height={100}
                width={width}
                values={legend}
              />
            </div>
            :
            null
        }
      </div>

      {
        showTimline &&
        <footer
          className="timeline"
          style={{
            height: height - topSectionHeight || 0
          }}
        >
          <Timeline
            dimensions={{
              width,
              height: height - topSectionHeight || 0
            }}
            palette={palette}
            data={data}
            yearState={[displayedYear, setDisplayedYear]}
          />
        </footer>
      }
      <ReactTooltip id="histoire-dunkerque-tooltip" />
    </div>
  )
}