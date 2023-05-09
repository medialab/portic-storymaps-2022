import React, { useContext, useEffect } from 'react';

import AlluvialChart from '../../components/AlluvialChart'

export default function SmogglageStatus ({
    data,
    width,
    height
}) {
    const steps = [
      {
        field: 'is_smoggleur',
        label: 'label',
        title: 'type de trajet des navires anglais',
        sortOrder: 'descending'
      },
      {
        field: 'departure_fr',
        title: 'port de départ',
        sortOrder: 'descending'
      },
      
    ];

    const vizId = 'smoggleur-statut';

    return (
        <>
            <AlluvialChart { ...{ 
              data: data.map(d => ({
                ...d,
                label: d.is_smoggleur === '0' ? 'non-smoggleur': 'smoggleur'
              })), 
              steps, 
              dimensions: {width, height},
              colorPalette: {
                '0': '#336D7C',
                '1': 'red',

                'Lorient': 'lightgrey',
                'Roscoff': 'grey',
                'Bordeaux': 'lightgrey',
                'Calais': 'grey',
                'Boulogne-sur-Mer': 'lightgrey',
                'Dunkerque': 'grey',
              }
            } } />
            <img
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
          />
        </>
    )
}