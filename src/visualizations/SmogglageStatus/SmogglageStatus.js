import React, { useContext, useEffect, useMemo } from 'react';

import AlluvialChart from '../../components/AlluvialChart'

import './SmogglageStatus.scss';

export default function SmogglageStatus({
  data,
  width,
  height
}) {
  const steps = [
    {
      field: 'departure_fr',
      title: 'port de départ',
      sortOrder: 'descending',
      label: 'portLabel'
    },
    {
      field: 'is_smoggleur',
      label: 'smoggleurLabel',
      title: 'type de trajet des navires anglais',
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
      portLabel: `${d.departure_fr} (${pctSmoggleurs}% de smoggleurs)`,
      smoggleurLabel: d.is_smoggleur === '0' ? 'non-smoggleur' : 'smoggleur'
    }
  });
  }, [data])
  return (
    <>
      <AlluvialChart 
        className="SmogglageStatus"
      {...{
        data: vizData,
        steps,
        dimensions: { width, height },
        colorPalette: {
          '0': '#336D7C',
          '1': 'red',

          'Lorient': 'lightgrey',
          'Roscoff': 'lightgrey',
          'Bordeaux': 'lightgrey',
          'Calais': 'grey',
          'Boulogne-sur-Mer': 'grey',
          'Dunkerque': 'red',
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