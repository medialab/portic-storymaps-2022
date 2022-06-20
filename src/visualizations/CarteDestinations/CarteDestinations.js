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
        projectionTemplate='from France to England'
        layers={[
          // {
          //   type: 'svg',
          //   data: data.get('map_backgrounds/world_map.svg'),//: data['map_backgrounds/map_france_1789.geojson'],
          //   animated: true
          // },
          {
            type: 'choropleth',
            animated: true,
            data: data.get('map_backgrounds/world_map.geojson'),// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
            // reverseColors: atlasMode ? undefined : true,
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