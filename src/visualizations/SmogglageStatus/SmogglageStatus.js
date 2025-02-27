import React, { useContext, useEffect, useMemo } from 'react';

import AlluvialChart from '../../components/AlluvialChart'
import colorsPalettes from '../../utils/colorPalettes';

import './SmogglageStatus.scss';
import translate from '../../utils/translate';

const {dunkerqueColor, britishColor} = colorsPalettes;

export default function SmogglageStatus({
  data,
  width,
  height,
  atlasMode,
  lang
}) {
  const steps = [
    {
      field: lang === 'fr' ? 'departure_fr' : 'departure_en',
      title: translate('SmogglageStatus', 'left_title', lang),
      sortOrder: 'descending',
      label: 'portLabel'
    },
    {
      field: 'is_smoggleur',
      label: 'smoggleurLabel',
      title: translate('SmogglageStatus', 'right_title', lang),
      sortOrder: 'descending'
    },
  ];

  // const vizId = 'smoggleur-statut';

  const vizData = useMemo(() => {

    const pctMap = data.reduce((pMap, d) => {
      const dest = d.departure_fr;
      if (!pMap[dest]) {
        pMap[dest] = {
          smogglers: 0,
          normals: 0
        }
      }
      const cat = d.is_smoggleur === '0' ? 'normals' : 'smogglers';
      pMap[dest][cat] += 1
      return pMap
    }, {});

    return data.map(d => {
      const pctSmoggleurs = parseInt(pctMap[d.departure_fr].smogglers / (pctMap[d.departure_fr].smogglers + pctMap[d.departure_fr].normals) * 100);
      return {
      ...d,
      portLabel: translate('SmogglageStatus', 'port_label', lang, {
        port: lang === 'fr' ? d.departure_fr : d.departure_en,
        pct: pctSmoggleurs
      }),
      smoggleurLabel: d.is_smoggleur === '0' ? translate('SmogglageStatus', 'non_smoggler', lang) : translate('SmogglageStatus', 'smoggler', lang)
    }
  });
  }, [data, lang, translate])
  return (
    <>
      <AlluvialChart 
        className="SmogglageStatus"
      {...{
        data: vizData,
        steps,
        dimensions: { 
          width: atlasMode ? width : width - 10, 
          height 
        },
        colorPalette: {
          '0': '#336D7C',
          '1': britishColor,

          'Lorient': 'lightgrey',
          'Roscoff': 'lightgrey',
          'Bordeaux': 'lightgrey',
          'Calais': 'grey',
          'Boulogne-sur-Mer': 'grey',
          'Dunkerque': dunkerqueColor,
          'Dunkirk': dunkerqueColor,
        }
      }} />
      {/* <img
        src={`${process.env.BASE_PATH}/assets/${vizId}.jpg`}
        style={{
          objectFit: 'contain',
          width,
          height,
          position: 'absolute',
          left: width / 2 - width / 8,
          top: height / 8,
          maxWidth: width / 4,
        }}
      /> */}
    </>
  )
}