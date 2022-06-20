import React, { useMemo } from "react"

import GeographicMapChart from "../../components/GeographicMapChart";

export default function FraudeExportDunkerque({
    data,
    dimensions: {
      width, 
      height
    },
    atlasMode,
    // lang,
    ...props
}) {

    return (
      <GeographicMapChart
        title={'Carte des destinations des navires partis de Dunkerque'}
        projectionConfig={{
          scale: 100,
          centerX: 0, //2.376776,
          centerY: 0, //51.034368,
        }}
        layers={[
          {
            type: 'svg',
            data,//: data['map_backgrounds/map_france_1789.geojson'],
            animated: true
          },
          {
            type: 'points',
            label: {
              field: 'label'
            },
            data: [
              {
                latitude: 51.034368,
                longitude: 2.376776,
                size: 5,
                label: 'test Dunkerque',
                color: 'red'
              }
            ]
          }
        ]}
        height={atlasMode ? window.innerHeight * .9 : height}
        width={width}
      />
    )
}