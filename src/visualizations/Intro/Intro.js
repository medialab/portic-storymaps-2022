import React, { useMemo, useReducer } from "react";
import cx from 'classnames';

import GeographicMapChart from "../../components/GeographicMapChart";

import './Intro.scss';
import DunkerqueDisplay from "./DunkerqueDisplay";
import { G } from "../../components/animatedPrimitives";

const DUNKERQUE_COORDINATES = [
  2.2730677,
  51.016994,
]

export default function Intro({
  data,
  lang,
  width,
  height,
  callerProps = {
    step: '1'
  },
  atlasMode,
  dimensions,
  ...props
}) {
  const { step } = callerProps;
  const currentProjectionTemplate = useMemo(function setCurrentProjectionTemplate() {
    switch (step) {
      case '2':
        return 'from France to England';
      case '3':
      case '4':
        return 'around Dunkerque';
        // return 'from France to England';
      default:
        // return 'from France to England';
        return 'France';
    }
  });
  const currentProjectionConfig = useMemo(function setCurrentProjectionTemplate() {
    switch (step) {
      case '1':
        return {
          scale: height * 3,
        }
      default:
        return {}
    }
  });
  return (
    <div className={cx("Intro", {'is-atlas-mode': atlasMode})}
      style={{
        width,
        height
      }}
    >
      <GeographicMapChart
        // title={'Carte des destinations des navires partis de Dunkerque'}
        projectionTemplate={currentProjectionTemplate}
        projectionConfig={currentProjectionConfig}
        layers={[
          {
            type: 'choropleth',
            // fix issue with map background when animating
            data: {
              ...data,
              features: data.features.filter(f => f.id !== 95)
            },
            animated: true,
            color: {
              field: 'unitlevel',
              palette: {
                '1': 'transparent',
                '2': 'rgba(255,255,255,0.2)'
              }
            }
            // data: data.get('map_backgrounds/world_map.svg'),//: data['map_backgrounds/map_france_1789.geojson'],
            // animated: true
          },
          // {
          //   type: 'choropleth',
          //   animated: true,
          //   data: data.get('map_backgrounds/world_map.geojson'),// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
          //   // reverseColors: atlasMode ? undefined : true,
          // },
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
              // showDetailsInMap,
            },
            renderObjects: ({ projection, width, height, atlasMode }) => {
              const [x, y] = projection(DUNKERQUE_COORDINATES);
              return (
                <G
                  transform={`translate(${x}, ${y})`}
                  config={{duration: 500}}
                >
                  <DunkerqueDisplay
                    projection={projection}
                    step={step}
                    width={width}
                    height={height}
                    lang={lang}
                  />
                </G>
              )
            }
          }
        ]}
        height={height}
        // height={atlasMode ? window.innerHeight * .9 : height}
        width={width}
      />
    </div>
  )
}