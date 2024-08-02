import React, { useEffect, useMemo, useState } from 'react';

import translate from '../../utils/translate';
import { range } from 'lodash';
import BarChart from '../../components/BarChart';
import GeographicMapChart from '../../components/GeographicMapChart';
import { max } from 'd3-array';
import { scaleLinear } from 'd3-scale';

import './HomeportSmoggleurs.scss'
import { AnimatedCircle } from '../../components/AnimatedSvgElements';
import { G, Line, Text } from '../../components/animatedPrimitives';

export default function HomeportSmoggleurs({
  data: inputData,
  width,
  height: initialHeight,
  lang,
  atlasMode,
  callerProps = {},
  ...props
}) {
  const data = inputData.get('homeport-smoggleurs.csv');

  const [highlightedDestination, setHighlightedDestination] = useState(callerProps.port);

  useEffect(() => {
    setHighlightedDestination(callerProps.port);
  }, [callerProps.port])

  const height = atlasMode ? window.innerHeight * .95 : initialHeight;

  const backgroundMap = useMemo(() => {
    const obj = inputData.get('map_backgrounds/world_map.geojson');
    return {
      ...obj,
      features: obj.features.filter(({ properties }) => properties.dominant === 'Grande-Bretagne' || properties.shortname === 'Grande-Bretagne')
    }
  }, [inputData]);

  const years = useMemo(() => range(1781, 1791), []);

  const barchartData = useMemo(() => {
    return years.map(year => {
      const relevantData = highlightedDestination ? data.filter(({destination}) => destination === highlightedDestination) : data;
      const total = relevantData.reduce((sum, port) => port[year] && !isNaN(+port[year]) ? sum + +port[year] : sum, 0);
      return {
        year,
        total
      }
    })
  }, [data, highlightedDestination]);

  const barHeight = height * .25;
  const mapHeight = height * .75;

  const mapData = useMemo(() => {
    return data
      .filter(({ destination }) => destination !== 'Non Localisés')
      .map((props) => {
        const total = years.reduce((sum, year) => {
          if (props[year]) {
            return sum + (+props[year])
          }
          return sum;
        }, 0);
        return {
          ...props,
          total
        }
      })
      .sort((a, b) => {
        if (+a.lat > +b.lat) {
          return -1;
        }
        return 1;
      })
  }, [data]);

  const maxCircleArea = useMemo(() => {
    const maxDimension = max([width, height]);
    const maxObjectRadius = maxDimension * .01;
    return Math.PI * maxObjectRadius * maxObjectRadius;
  }, [width, height]);

  const maxTotal = useMemo(() => max(mapData.map(({ total }) => total)), [mapData]);

  const { areaScale, fontSizeScale } = useMemo(() => {
    return {
      areaScale: scaleLinear().domain([0, maxTotal]).range([10, maxCircleArea]),
      fontSizeScale: scaleLinear().domain([0, maxTotal]).range([7, 12])
    }
  }, [mapData, maxCircleArea]);


  const dataGroups = useMemo(() => {
    const ouestPorts = ['Newcastle', ];
    const nordPorts = [
      'Dublin', 'Glasgow', 'Ayr', 'Donaghadee', 'Belfast', 'Wick', 'Banff', 'Aberseen', 'Leith', 'Woodbridge', 'Sunderland', 'Whitby',
      'Whitehaven', 'Ramsay (I de Man)','Mersey',
      'Robin Hood Bay', 'Scarborough', 'York', 'Hull',
      'Leigh', 'Cumberland', 'Saint-Helen\'s',
      'Milton',
    ];
    const sudPorts = [
      'Penzance', 'Aurigny', 'Guernesey',
      'Pastow', 'Plymouth', 'Darmouth', 'Wateford',
      'Faversham', 'Wells', 'Corton'
    ]

    return {
      'Est': mapData.filter(({ Facade, lat, destination }) => 
        Facade === 'Est' && +lat >= 51.15 && !ouestPorts.includes(destination) && !nordPorts.includes(destination)  && !sudPorts.includes(destination)
      ),
      'Ouest': mapData.filter(({ Facade, lat, destination }) => 
        (Facade === 'Ouest' || +lat < 51.15 || ouestPorts.includes(destination))
        &&
        (!nordPorts.includes(destination) && !sudPorts.includes(destination))
      ),
      'Sud': mapData.filter(({ Facade, lat, destination }) => (Facade === 'Sud' || sudPorts.includes(destination)) && !ouestPorts.includes(destination))
        .sort((a, b) => {
          if (+a.lon > +b.lon) {
            return 1;
          }
          return -1;
        }),
      'Nord':mapData.filter(({ destination }) => nordPorts.includes(destination))
      .sort((a, b) => {
        if (+a.lon > +b.lon) {
          return 1;
        }
        return -1;
      }),

    }
  }, [mapData])

  return (
    <div className="HomeportSmoggleurs">
      <GeographicMapChart
        title={translate('HomeportSmoggleurs', 'title', lang)}
        hideTitle={!atlasMode}
        projectionTemplate={'England'}
        // projectionTemplate={'south of England'}
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
              return <g 
                className="port-groups"
                onMouseLeave={() => setHighlightedDestination()}
              >
                {
                  Object.entries(dataGroups).map(([groupName, ports]) => {
                    const margin = width * .1;
                    return ports.map(({ latitude, lon, lat, destination, Facade, total, ...props }, objectIndex) => {
                      const area = areaScale(total);
                      const fontSize = fontSizeScale(total);
                      const radius = Math.sqrt((area / Math.PI));
                      const [x, y] = projection([+lon, +lat]);
                      // const fontSize = ((height - margin) / mapData.length) * 1.5;
                      let textY = margin + objectIndex * ((height - margin * 2) / dataGroups.Est.length);
                      let textX = margin;
                      let textAnchor = 'end';
                      let transform = '';

                      switch (groupName) {
                        case 'Est':
                          textX = width - margin;
                          textAnchor = "start";
                          break;
                        case 'Sud':
                          textY = height - margin * .75;
                          textX = margin + objectIndex * ((width - margin * 2) / ports.length);
                          textAnchor = "end";
                          transform = 'rotate(-45)';
                          break;
                        case 'Nord':
                          textY = margin * 1;
                          textX = margin * 2 + objectIndex * ((width - margin * 4) / ports.length);
                          textAnchor = "start";
                          transform = 'rotate(-45)';
                        case 'Ouest':
                        default:
                          break;
                      }

                      const handleMouseEnter = (e) => {
                        setHighlightedDestination(destination);
                      }
                      return (
                        <G
                          className="port-group"
                          data-tip="coucou"
                          data-for="tooltip"
                          onMouseEnter={handleMouseEnter}
                        >
                          <Line
                            x1={textX}
                            y1={textY}
                            x2={x}
                            y2={y}
                          />
                          <AnimatedCircle
                            fill="red"
                            stroke="white"
                            cx={x}
                            cy={y}
                            r={radius}
                          />
                          <G
                            transform={`translate(${textX}, ${textY})`}
                          >
                            <Text
                              x={0}
                              y={0}
                              style={{ fontSize }}
                              textAnchor={textAnchor}
                              transform={transform}
                            // transformOrigin={transformOrigin}
                            >
                              {destination} ({total})
                            </Text>
                          </G>
                        </G>
                      );

                    })
                  })
                }
              </g>
            }
          }
        ]}
        height={mapHeight}
        width={width}
      />
      <BarChart
        {
        ...{
          data: barchartData,
          width,
          height: barHeight,
          margins: {
            left: 120
          },
          x: {
            field: 'year',
            fillGaps: true,
            domain: [1781, 1791]
          },
          y: {
            field: 'total',
            title: translate('HomeportSmoggleurs', 'y', lang),
            domain: [0, maxTotal],
            tickSpan: 200
          }
        }
        }
      />
    </div>
  );
}