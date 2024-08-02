import React, { useMemo, useReducer } from "react";

import GeographicMapChart from "../../components/GeographicMapChart";
import { formatNumber, reducerBrush } from "../../utils/misc";
import translate from "../../utils/translate";

import LineChart from '../../components/LineChart';
import { scaleLinear } from "d3-scale";
import { groups, max } from "d3-array";

import palettes from '../../utils/colorPalettes.js';

import './PecheMap.scss';

const {importsExports: somePalette} = palettes;

export default function PecheMap({
  data,
  dimensions,
  lang,
  atlasMode,
  // colorPalette = {
  //   'Islande': 'red',
  //   'Terre-Neuve': 'blue',
  //   'Hitlande': 'purple',
  //   'Hareng': 'orange',
  //   'Dogre Banc': 'brown'
  // },
  ...props
}) {
  const zones = useMemo(() => ['Islande', 'Terre-Neuve', 'Hitlande', 'Hareng', 'Dogre Banc']
  .map(d => translate('PecheMap', d, lang))
  , [data, lang, translate]);
  const colorPalette = useMemo(() => {
    const colors = Object.values(somePalette);
    return zones.reduce((cur, key, index) => ({
      ...cur,
      [key]: colors[index]
    }), {});
  }
  , [zones])
  
  const { width = 100, height = 100 } = dimensions;
  // const [brush, setBrush] = useReducer(reducerBrush, [undefined, undefined, undefined]);
  const dataMap = useMemo(() => data.get('map_backgrounds/physical_world_map.geojson'), [data]);
  const zonesMapData = useMemo(() => {
    const feature = data.get('evolution-peche-zones.geojson');
    return {
      ...feature,
      features: feature.features
      .map(d => ({
        ...d,
        properties: {
          ...d.properties,
          shortname: translate('PecheMap', d.properties.shortname, lang)
        }
      }))
    }
  }, [data, lang, translate]);
  
  const dataStats = useMemo(function prepareData() {
    return data.get('peche-map-stats.csv').map(row => {
      return {
        ...row,
        value: row['value'] === '' ? 0 : +row['value'],
        type_zone_peche: translate('PecheMap', row.type_zone_peche, lang)
      }
    })
  }, [data]);
  
  const graphHeight = 200;
  return (
    <div className="PecheMap">
      <GeographicMapChart
        // projectionTemplate={'France'}
        hideTitle={!atlasMode}
        projectionTemplate={'world north'}
        layers={[
          {
            type: 'choropleth',
            animated: false,
            showAllParts: false,
            className: 'background-map',
            data: dataMap,// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
          },
          {
            type: 'choropleth',
            animated: false,
            showAllParts: false,
            data: zonesMapData,
            tooltip: (d) => d.properties.shortname,
            className: 'peche-zones',
            color: {
              field: 'shortname',
              palette: colorPalette,
              // palette: {
              //   'Islande': 'red',
              //   'Terre-Neuve': 'blue',
              //   'Shetlands': 'lightblue',
              //   'Dunkerque_mer_du_nor': 'lightgreen' // colors['Dogre Banc'](2),
              // }
            }
          },
        ]}
        height={height - graphHeight}
        width={width}
      />

      <LineChart
        width={width}
        height={graphHeight}
        data={dataStats}
        x={{
          field: 'annee',
          title: translate('PecheMap', 'x', lang),
        }}
        y={{
          field: 'value',
          title: translate('PecheMap', 'y', lang),
          tickSpan: 250000,
          tickFormat: d => `${formatNumber(d)} lt.`
        }}
        color={{
          field: 'type_zone_peche',
          palette: colorPalette
        }}
        tooltip={
          (d) => translate('PecheMap', 'tooltip', lang, {
            type: d['type_zone_peche'],
            value: formatNumber(d['value']),
            year: d['annee']
          })
        }
        margins={{
          left: 100,
          top: 50,
          bottom: 40,
          right: 20
        }}
        // brushState={[brush, setBrush]}
      />
    </div>
  )
}