import React, { useMemo, useState } from 'react';

import translate from '../../utils/translate';
import GeographicMapChart from '../../components/GeographicMapChart';
import { max } from 'd3-array';
import { scaleLinear } from 'd3-scale';

import './DepartsFrVersAngleterre.scss'
import ReactTooltip from 'react-tooltip';
import { formatNumber } from '../../utils/misc';

const Legend = ({ projection, width, height, atlasMode }) => {
  const index = 'legend';
  const fontSize = 10;
  const leftRadius = width / 30;
  const rightRadius = width / 40;
  return (
    <g className="port-group legend"
      transform={`translate(${width * .8}, ${height / 5})`}
    >
      <rect
        fill="rgba(255,255,255,0.5)"
        stroke="transparent"
        width={width / 2.5}
        height={height / 5}
        x={-width / 5}
        y={-height / 10}
      />
      <text
        style={{ fontSize }}
        x={-leftRadius - 5}
        y={fontSize / 2}
        textAnchor="end"
      >
        {'départs vers la Grande-Bretagne'}
      </text>
      <text
        style={{ fontSize }}
        x={rightRadius + 5}
        y={fontSize / 2}
        textAnchor="start"
      >
        {'départs vers d\'autres directions'}
      </text>

      <circle
        stroke="red"
        fill="rgba(255,255,255,0.5)"
        strokeDasharray="2, 4"
        cx={-1}
        cy={0}
        r={leftRadius}
        clipPath={`url(#cut-off-left-${index})`}
      />
      <line
        x1={-1}
        x2={-1}
        y1={-leftRadius}
        y2={leftRadius}
        stroke="red"
        fill="rgba(255,255,255,0.5)"
        strokeDasharray="2, 4"
      />
      <clipPath id={`cut-off-left-${index}`}>
        <rect x={-leftRadius - 2} y={-leftRadius - 2} width={leftRadius + 1} height={leftRadius * 2 + 4} />
      </clipPath>
      <circle
        stroke="grey"
        fill="rgba(255,255,255,0.5)"
        strokeDasharray="2, 4"
        cx={1}
        cy={0}
        r={rightRadius}
        clipPath={`url(#cut-off-right-${index})`}
      />
      <line
        x1={1}
        x2={1}
        y1={-rightRadius}
        y2={rightRadius}
        stroke="grey"
        fill="rgba(255,255,255,0.5)"
        strokeDasharray="2, 4"
      />
      <clipPath id={`cut-off-right-${index}`}>
        <rect x={0} y={-rightRadius - 2} width={rightRadius + 4} height={rightRadius * 2 + 4} />
      </clipPath>

    </g>
  )
}

export default function DepartsFrVersAngleterre({
  data: inputData,
  width,
  height: initialHeight,
  lang,
  atlasMode,
  ...props
}) {
  const data = inputData.get('departs-fr-vers-angleterre.csv')
    .sort((a, b) => {
      const sumA = parseInt(a.departs_vers_gb_tonnage) + parseInt(a.departs_hors_gb_tonnage)
      const sumB = parseInt(b.departs_vers_gb_tonnage) + parseInt(b.departs_hors_gb_tonnage)
      if (sumA > sumB) {
        return -1;
      }
      return 1;
    })
  console.log(data.filter(({ port }) => port === 'Dunkerque'))

  const height = atlasMode ? window.innerHeight * .95 : initialHeight;

  const backgroundMap = useMemo(() => {
    return inputData.get('map_backgrounds/world_map.geojson');
  }, [inputData]);

  const maxCircleArea = useMemo(() => {
    const maxDimension = max([width, height]);
    const maxObjectRadius = maxDimension * .05;
    return Math.PI * maxObjectRadius * maxObjectRadius;
  }, [width, height]);

  const maxTotal = useMemo(() => max(data.map(({ departs_vers_gb_tonnage, departs_hors_gb_tonnage }) => parseInt(departs_vers_gb_tonnage) + parseInt(departs_hors_gb_tonnage))), [data]);
  const { areaScale, fontSizeScale } = useMemo(() => {
    return {
      areaScale: scaleLinear().domain([0, maxTotal]).range([10, maxCircleArea]),
      fontSizeScale: scaleLinear().domain([0, maxTotal]).range([7, 12])
    }
  }, [data, maxCircleArea]);

  return (
    <div className="DepartsFrVersAngleterre">
      <GeographicMapChart
        title={'Les départs depuis la France vers l\'Angleterre en 1787, par provinces'}
        projectionTemplate={'France'}
        projectionConfig={{
          centerY: 48,
          scale: height * 4
        }}
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
              return data.map(({ port, ports, latitude, longitude, departs_vers_gb_tonnage, departs_hors_gb_tonnage }, index) => {
                const [x, y] = projection([longitude, latitude]);
                const fontSize = fontSizeScale(parseInt(departs_vers_gb_tonnage) + parseInt(departs_hors_gb_tonnage));
                const leftRadius = Math.sqrt((areaScale(departs_vers_gb_tonnage) / Math.PI));
                const rightRadius = Math.sqrt((areaScale(departs_hors_gb_tonnage) / Math.PI));
                const leftTooltip = `En 1787, ${formatNumber(parseInt(departs_vers_gb_tonnage))} tx partaient des ports de ${port} vers des ports de Grande-Bretagne (ports concernés : ${ports})`
                const rightTooltip = `En 1787, ${formatNumber(parseInt(departs_hors_gb_tonnage))} tx partaient des ports de ${port} vers des ports hors Grande-Bretagne (ports concernés : ${ports})`
                return (
                  <g className="port-group"
                    transform={`translate(${x}, ${y})`}
                    key={port}
                  >
                    <text
                      style={{ fontSize }}
                      x={-leftRadius - 2}
                      y={fontSize / 2}
                      textAnchor="end"
                    >
                      {port}
                    </text>
                    <text
                      style={{ fontSize }}
                      x={-leftRadius - 2}
                      y={fontSize / 2 + fontSize * 1.1}
                      textAnchor="end"
                    >
                      ({parseInt(parseInt(departs_vers_gb_tonnage) / (parseInt(departs_vers_gb_tonnage) + parseInt(departs_hors_gb_tonnage)) * 100)}% vers la GB)
                    </text>

                    <circle
                      fill="red"
                      stroke="white"
                      cx={-1}
                      cy={0}
                      r={leftRadius}
                      clipPath={`url(#cut-off-left-${index})`}
                      data-for="map-tooltip"
                      data-tip={leftTooltip}
                    />
                    <clipPath id={`cut-off-left-${index}`}>
                      <rect x={-leftRadius - 2} y={-leftRadius - 2} width={leftRadius + 1} height={leftRadius * 2 + 4} />
                    </clipPath>
                    <circle
                      fill="grey"
                      stroke="white"
                      cx={1}
                      cy={0}
                      r={rightRadius}
                      clipPath={`url(#cut-off-right-${index})`}
                      data-for="map-tooltip"
                      data-tip={rightTooltip}
                    />
                    <clipPath id={`cut-off-right-${index}`}>
                      <rect x={0} y={-rightRadius - 2} width={rightRadius + 4} height={rightRadius * 2 + 4} />
                    </clipPath>

                  </g>
                )
              })
            }
          },
          {
            type: 'custom',
            renderObjects: (props) => {
              return <Legend {...props} />
            }
          }
        ]}
        height={height}
        width={width}
      />
      <ReactTooltip id="map-tooltip" />
    </div>
  );
}