import { useMemo, useState, useEffect } from "react";
import { max, min } from 'd3-array';

import GeographicMapChart from '../../components/GeographicMapChart'
import renderObjects from './renderObjects';

import './ExportsVsSmogglage.scss';

import {
  portsProductsGroups,
  // portsProductsMap,
  // productsQuantiFields,
  portsQuantiFields,
} from './groupings';
import RadarChart from "../../components/RadarChart";
import { formatNumber } from "../../utils/misc";
import ReactTooltip from "react-tooltip";
import translate from "../../utils/translate";
import colorsPalettes from "../../utils/colorPalettes";

const {britishColor} = colorsPalettes;

export default function ExportsVsSmogglage({
  width,
  height,
  data,
  atlasMode,
  lang,
}) {

  const [selectedPortsOverviewQuantiField, setPortsOverviewQuantiField] = useState('shipment_price');
  const [selectedPort, setSelectedPort] = useState(undefined);
  const [highlightedPort, setHighlightedPort] = useState(undefined);


  const maxCircleArea = useMemo(() => {
    const maxDimension = max([width, height]);
    const maxObjectRadius = maxDimension * .01;
    return Math.PI * maxObjectRadius * maxObjectRadius;
  }, [width, height]);

  const {
    // productsData,
    homeportsData,
    // portsList
  } = useMemo(() => {
    return {
      // productsData: data.get('smogglage-estimation-par-produit.csv')
      //   .map(input => {
      //     return Object.keys(input).reduce((res, key) => {
      //       return {
      //         ...res,
      //         [key]: productsQuantiFields.includes(key) ? +input[key].replace(',', '.') : input[key]
      //       }
      //     }, {})
      //   }),
      homeportsData: data.get('smogglage-vs-exports-par-homeport.csv'),
      // portsList: data.get('smogglage-vs-exports-par-homeport.csv').map(p => p.port)
    }
  }, [data]);

  const radarAxis = Object.keys(portsProductsGroups).map(p => translate('ExportsVsSmogglage', p, lang))
  const radarData = useMemo(() => {
    let absoluteMaxValue = -Infinity;
    let output = homeportsData.map((port) => {
      const values = Object.keys(portsProductsGroups).reduce((current, groupKey) => {
        const children = portsProductsGroups[groupKey].children;
        const value = children.reduce((sum, childKey) => sum + +port[childKey], 0);
        return {
          ...current,
          [translate('ExportsVsSmogglage', groupKey, lang)]: value
        }
      }, {});
      const maxValue = max(Object.values(values));
      if (maxValue > absoluteMaxValue) {
        absoluteMaxValue = maxValue;
      }
      // normalize values to 0-1
      const normalizedData = Object.keys(values).reduce((cur, key) => ({
        ...cur,
        [key]: values[key] / maxValue
      }), {})
      return {
        meta: {
          name: port.port,
          color: britishColor  // 'rgba(255,0,0,0.5)',
        },
        data: values,
        normalizedData
      }
    })
    if (selectedPort) {
      return output
        .filter(p => p.meta.name === selectedPort)
        .map((port) => {
          return {
            ...port,
            absoluteData: port.data,
            data: port.normalizedData
          }
        })
    }
    // normalize values to absolute 0-1
    output = output.map((port) => {
      return {
        ...port,
        absoluteData: port.data,
        data: Object.keys(port.data).reduce((current, key) => {
          const value = port.data[key];
          const normalized = value / absoluteMaxValue;
          return {
            ...current,
            [key]: normalized
          }
        }, {})
      }
    })
    return output;
  }, [homeportsData, selectedPort, lang, translate]);
  // const detailsData = useMemo(() => {
  //   if (homeportsData) {
  //     const port = homeportsData.find(p => p.port === selectedPort);
  //     if (port) {
  //       return portsQuantiFields.map((field) => {
  //         const unit = field.split('(').length > 1 ? field.split('(').pop().replace(')', '') : 'indéfini';
  //         return {
  //           field: field.split('(')[0],
  //           quantity: +port[field],
  //           group: unit
  //         }
  //       })
  //     }
  //   }
  //   return undefined;
  // }, [selectedPort, data, lang, translate]);

  const [projectionLatitude, projectionLongitude] = useMemo(() => {
    if (selectedPort && homeportsData) {
      const port = homeportsData.find(({ port }) => port === selectedPort);
      if (port) {
        return [
          port.latitude,
          port.longitude
        ]
      }
    }
    return [];
  }, [homeportsData, selectedPort]);

  const portsOverviewFieldsChoices = [
    // {
    //   field: 'tonnage',
    //   label: 'tonnage'
    // },
    {
      field: 'nb_pointcalls',
      label: translate('ExportsVsSmogglage', 'legend_travels', lang)
    },
    {
      field: 'shipment_price',
      label: translate('ExportsVsSmogglage', 'legend_price', lang)
    }
    // 'tonnage',
    // 'nb_pointcalls',
    // 'shipment_price'
  ];


  const backgroundMap = useMemo(() => {
    const obj = data.get('map_backgrounds/england_map.geojson')
    return {
      ...obj,
      features: obj.features.filter(({ properties }) => properties.dominant === 'Grande-Bretagne' || properties.shortname === 'Grande-Bretagne')
    }
  }, [data]);

  const radarSize = selectedPort ? width / 2 : width / 3;
  return (
    <div className='ExportsVsSmogglage'>
      <GeographicMapChart
        title={translate('ExportsVsSmogglage', 'title', lang)}
        hideTitle={!atlasMode}
        projectionTemplate={'England'}
        projectionConfig={selectedPort ? {
          centerX: projectionLongitude,
          centerY: projectionLatitude,
          scale: height * 50
        } : undefined}
        layers={[
          {
            type: 'choropleth',
            animated: false,
            data: backgroundMap// data.get('map_backgrounds/england_map.geojson'),// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
            // reverseColors: atlasMode ? undefined : true,
          },
          {
            type: 'custom',
            data: {
              homeportsData,
              maxCircleArea,
              circleSizeVariable: selectedPortsOverviewQuantiField,
              selectedPort,
              setSelectedPort,
              highlightedPort,
              onMouseOver: (port) => setHighlightedPort(port),
              onMouseOut: () => setHighlightedPort(),
              // flagGroupModalities,
              lang,
              // highlightedDestination,
              // setHighlightedDestination,
              // containerWidth: width,
              // containerHeight: height,
              // showOffscreenPorts,
              // showDetailsInMap,
            },
            renderObjects
          }
        ]}
        height={atlasMode ? window.innerHeight * .9 : height}
        width={width}
      />
      <div className="radar-container"
        style={{
          position: 'absolute',
          transition: '.5s all ease',
          pointerEvents: 'none',
          right: selectedPort ? width / 2 - radarSize / 2 : width / 8,
          top: selectedPort ? radarSize / 4 : 0
        }}
      >
        <RadarChart
          lang={lang}
          data={radarData}
          axis={radarAxis}
          size={radarSize}
          highlightedObjectName={highlightedPort}
          onMouseOverObject={(port) => setHighlightedPort(port)}
          onMouseOutObject={() => setHighlightedPort()}
        />
      </div>
      <div className={`legend-container ${selectedPort ? 'is-hidden' : ''}`}>


        {/* <div>Quantifier la visualisation suivante (faite à partir de <a href="https://github.com/medialab/portic-datasprint-2022/blob/main/productions/module_05/data/dunkerque_smugglers_shipmentvalues.csv" target="blank">ces données</a>) par :</div> */}
        <div>{translate('ExportsVsSmogglage', 'legend_toggle_title', lang)} :</div>
        <ul>
          {
            portsOverviewFieldsChoices
              .map(({ field, label }) => {
                const handleClick = () => {
                  setPortsOverviewQuantiField(field);
                  ReactTooltip.rebuild();
                }
                return (
                  <li key={field} onClick={handleClick}>
                    <input
                      type="radio"
                      checked={selectedPortsOverviewQuantiField === field}
                      readOnly
                    />
                    <span>
                      {label}
                    </span>
                  </li>
                )
              })
          }
          
        </ul>
        {atlasMode ?
            <p>
              <i>
                {translate('ExportsVsSmogglage', 'legend_howto', lang)}
              </i>
            </p>
            : null}
      </div>
      {/* <img
        src={`${process.env.BASE_PATH}/assets/exports-vs-smogglage.jpg`}
        {...{ width, height }}
        style={{ objectFit: 'contain' }}
      /> */}

      {
        // detailsData &&
        // <BarChart
        //   {...{
        //     data: detailsData
        //       .sort((a, b) => {
        //         if (a.quantity > b.quantity) {
        //           return -1;
        //         }
        //         return 1;
        //       })
        //     ,
        //     width: width,
        //     height: height * 2,
        //   }}
        //   orientation='vertical'

        //   y={{
        //     field: 'field',
        //   }}
        //   x={{
        //     field: 'quantity',
        //     tickFormat: d => `${formatNumber(d, lang)} lt`,
        //     title: 'quantity', // translate('TonnagesF12', 'destination', lang)
        //   }}

        //   color={{
        //     field: 'group',
        //   }}

        // />
      }
      <ReactTooltip id="smogglage-tip" />
    </div>
  )
}