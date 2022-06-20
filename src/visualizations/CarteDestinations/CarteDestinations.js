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
        layers={[
          {
            type: 'choropleth',
            data: data['map_backgrounds/map_france_1789.geojson'],
            animated: true
          },
        ]}
        height={atlasMode ? window.innerHeight * .9 : height}
        width={width}
      />
    )
}