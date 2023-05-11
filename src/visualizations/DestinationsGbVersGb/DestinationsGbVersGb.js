import React, { useMemo, useState } from 'react';

import translate from '../../utils/translate';
import GeographicMapChart from '../../components/GeographicMapChart';
import { max } from 'd3-array';
import { scaleLinear } from 'd3-scale';

import './DestinationsGbVersGb.scss'
import ReactTooltip from 'react-tooltip';
import { formatNumber } from '../../utils/misc';

export default function DestinationsGbVersGb({
  data: inputData,
  width,
  height: initialHeight,
  lang,
  atlasMode,
  ...props
}) {
  const data = inputData.get('destinations-gb-vers-gb.csv')
    .sort((a, b) => {
      const sumA = parseInt(a.tonnage) + parseInt(a.tonnage)
      const sumB = parseInt(b.tonnage) + parseInt(b.tonnage)
      if (sumA > sumB) {
        return -1;
      }
      return 1;
    })


  const height = atlasMode ? window.innerHeight * .95 : initialHeight;

  const backgroundMap = useMemo(() => {
    const obj = inputData.get('map_backgrounds/world_map.geojson');
    return {
      ...obj,
      features: obj.features.filter(({ properties }) => properties.dominant === 'Grande-Bretagne' || properties.shortname === 'Grande-Bretagne')
    }
  }, [inputData]);

  const maxCircleArea = useMemo(() => {
    const maxDimension = max([width, height]);
    const maxObjectRadius = maxDimension * .01;
    return Math.PI * maxObjectRadius * maxObjectRadius;
  }, [width, height]);

  const sumTotal = useMemo(() => data.reduce((sum, { nb_pointcalls }) => sum + parseInt(nb_pointcalls), 0), [data]);
  const maxPorts = useMemo(() => max(data.filter(({ category }) => category === 'port_specifie').map(({ nb_pointcalls }) => parseInt(nb_pointcalls))), [data]);

  const { areaScale, fontSizeScale } = useMemo(() => {
    return {
      areaScale: scaleLinear().domain([0, maxPorts]).range([10, maxCircleArea]),
      fontSizeScale: scaleLinear().domain([0, maxPorts]).range([7, 12])
    }
  }, [data, maxCircleArea]);

  const vizData = useMemo(() => {
    const barsStart = height / 10;
    const barsEnd = height - barsStart * 2;
    const barsHeight = barsEnd - barsStart;
    const barScale = scaleLinear().domain([0, sumTotal]).range([0, barsHeight]);
    let displacement = barsStart;
    return data
    .sort((a, b) => {
      if (a.category === 'gb_no_port') {
        return -1;
      } else if (b.category === 'gb_no_port') {
        return 1;
      }
      else if (a.category === 'fausse_destination') {
        return -1;
      }
      else if (+a.latitude > +b.latitude) {
        return -1;
      }
      return 1;
    })
    .map((datum) => {
      const { nb_pointcalls } = datum;
      const y = displacement;
      const barHeight = barScale(+nb_pointcalls);
      displacement += barHeight;
      return {
        ...datum,
        barY: y,
        barHeight
      }
    })
  }, [data, height]);

  const barsWidth = width / 20;
  const barsX = width * .77;
  const fontSize = 14;

  return (
    <div className="DestinationsGbVersGb">
      <GeographicMapChart
        title={'Destinations des navires britanniques partis de Dunkerque en 1789'}
        // projectionTemplate={'Angleterre'}
        projectionTemplate={'England'}
        layers={[
          {
            type: 'choropleth',
            data: backgroundMap,
            // animated: true,
            // color: {
            //   field: 'unitlevel',
            //   palette: {
            //     '1': 'transparent',
            //     '2': 'rgba(255,255,255,0.2)'
            //   }
            // }
            // data: data.get('map_backgrounds/world_map.svg'),//: data['map_backgrounds/map_france_1789.geojson'],
            // animated: true
          },
          {
            type: 'custom',
            data: {
              // vizData,
              // maxCircleArea,
              // flagGroupModalities,
              // lang,
              // highlightedDestination,
              // setHighlightedDestination,
              // containerWidth: width,
              // containerHeight: height,
              // showOffscreenPorts,
              // showDetailsInMap
            },
            renderObjects: ({ projection, width, height, atlasMode }) => {
              return vizData.map(({ port, latitude, longitude, nb_pointcalls, barY, barHeight, category }, index) => {
                const [x, y] = projection([+longitude, +latitude]);
                const radius = Math.sqrt((areaScale(+nb_pointcalls) / Math.PI));
                const colorMap ={
                  'port_specifie': 'red',
                  'fausse_destination': 'grey',
                  'gb_no_port': 'lightgrey'
                }
                const color = colorMap[category];
                const messages = {
                  'port_specifie': 'port spécifié',
                  'fausse_destination': 'fausse destination',
                  'gb_no_port': 'GB sans port'
                }
                return (
                  <g className="port-group"
                    key={port}

                    title={port}
                    data-for="map-tooltip"
                    data-tip={`${port} (${nb_pointcalls} voyages de navires britanniques depuis Dunkerque en 1789)`}
                  >
                    <rect
                      fill={color}
                      stroke="white"
                      x={barsX}
                      y={barY}
                      width={barsWidth}
                      height={barHeight}
                    />
                    {
                      category === 'port_specifie' ?
                        <>
                          <line
                            stroke="lightgrey"
                            strokeDasharray={'2,2'}
                            x1={x}
                            y1={y}
                            x2={barsX}
                            y2={barY + barHeight / 2}
                          />
                          <circle
                            fill={color}
                            stroke="white"
                            cx={x}
                            cy={y}
                            r={radius}
                          />
                        </>
                        : null
                    }
                    {
                      category !== 'port_specifie' || port === 'Londres' ?
                      <text
                        x={barsWidth + barsX + fontSize}
                        y={barY + barHeight / 2 + fontSize / 2}
                        style={{fontSize}}
                      >
                        {messages[category]}
                      </text>
                      : null
                    }
                  </g>
                )
              })
            }
          },
        ]}
        height={height}
        width={width}
      />
      <ReactTooltip id="map-tooltip" />
    </div>
  );
}