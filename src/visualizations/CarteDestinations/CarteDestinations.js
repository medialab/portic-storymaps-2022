import React, { useEffect, useMemo, useState } from "react";

import GeographicMapChart from "../../components/GeographicMapChart";

import renderObjects from './renderObjects';

import { max, min } from 'd3-array';

import './CarteDestinations.scss';
import Legend from "./Legend";
import ReactTooltip from "react-tooltip";
import translate from "../../utils/translate";

export default function FraudeExportDunkerque({
  data,
  dimensions: {
    width,
    height
  },
  atlasMode,
  lang = 'fr',
  callerProps = {},
  ...props
}) {
  const {
    projection: projectionTemplateFromProps = 'from France to England',
    mintonnage: minTonnageFromProps = 0,
    maxtonnage: maxTonnageFromProps = 550,
    detailleretrangers = undefined,
    longcours: longCoursOnlyFromProps,
    filtrespavillons: flagGroupFiltersFromProps = '',
    montrerhorschamp: showOffscreenPortsFromProps,
    montrerdetails: showDetailsInMapFromProps,
    destination = undefined
  } = callerProps;

  const groupStrangersFromProps = detailleretrangers === undefined;

  // states
  const [minTonnage, setMinTonnage] = useState(minTonnageFromProps);
  const [maxTonnage, setMaxTonnage] = useState(maxTonnageFromProps);
  const [groupStrangers, setGroupStrangers] = useState(groupStrangersFromProps);
  const [longCoursOnly, setLongCoursOnly] = useState(longCoursOnlyFromProps);
  const [flagGroupFilters, setFlagGroupFilters] = useState(flagGroupFiltersFromProps);
  const [projectionTemplate, setProjectionTemplate] = useState(projectionTemplateFromProps);
  const [showOffscreenPorts, setShowOffscreenPorts] = useState(showOffscreenPortsFromProps);
  const [showDetailsInMap, setShowDetailsInMap] = useState(showDetailsInMapFromProps);
  const [templatesVisible, setTemplatesVisible] = useState(false);
  const [highlightedDestination, setHighlightedDestination] = useState(destination);

  // update state from props
  // @todo factorize that with a custom hook
  useEffect(() => {
    setMinTonnage(+minTonnageFromProps);
  }, [minTonnageFromProps]);
  useEffect(() => {
    setMaxTonnage(+maxTonnageFromProps);
  }, [maxTonnageFromProps]);
  useEffect(() => {
    setGroupStrangers(groupStrangersFromProps);
    setFlagGroupFilters('');
  }, [groupStrangersFromProps]);
  useEffect(() => {
    setLongCoursOnly(longCoursOnlyFromProps !== undefined);
  }, [longCoursOnlyFromProps]);
  useEffect(() => {
    setFlagGroupFilters(flagGroupFiltersFromProps);
  }, [flagGroupFiltersFromProps]);
  useEffect(() => {
    setProjectionTemplate(projectionTemplateFromProps);
  }, [projectionTemplateFromProps]);

  useEffect(() => {
    setShowOffscreenPorts(showOffscreenPortsFromProps !== undefined);
  }, [showOffscreenPortsFromProps]);
  useEffect(() => {
    setHighlightedDestination(destination)
  }, [destination])

  useEffect(() => {
    setShowDetailsInMap(showDetailsInMapFromProps !== undefined);
  }, [showDetailsInMapFromProps]);

  useEffect(() => {
    ReactTooltip.rebuild();
  })

  // auto-update map templates
  // useEffect(() => {
  //   if (longCoursOnly) {
  //     setProjectionTemplate('world north')
  //   } else {
  //     setProjectionTemplate('from France to England')
  //   }
  // }, [longCoursOnly])


  const travels = data.get('destinations_from_dunkerque.csv') || [];
  const filterOptions = [
    {
      id: 'group_strangers'
    },
    {
      id: 'only_long_cours'
    },

    {
      id: 'show_offscreen_ports'
    },
    {
      id: 'show_details_in_map'
    }
  ];

  const { maxPossibleTonnage = 1000, vizData, flagGroupModalities = [] } = useMemo(() => {
    // filter relevant travels
    const flagGroupModalitiesTemp = new Set();
    const filteredTravels = travels.filter(travel => {
      const tonnage = +travel.tonnage;
      // list flag groups
      const isDunkerquois = travel.homeport == 'Dunkerque';
      let flagGroup = isDunkerquois ? 'dunkerquois' : groupStrangers ? travel.flag_fr === 'français' ? 'autres français' : 'étranger' : travel.flag_fr === 'français' ? 'autres français' : travel.flag_fr;
      const flagGroupTranslated = translate('CarteDestinations', flagGroup, lang);
      if (!flagGroupModalitiesTemp.has(flagGroupTranslated)) {
        flagGroupModalitiesTemp.add(flagGroupTranslated)
      }
      // first filter tonnage
      if (tonnage >= minTonnage && tonnage <= maxTonnage) {
        let accept = true;
        if (longCoursOnly) {
          accept = travel.long_cours === '1';
        }
        if (accept && flagGroupFilters.length) {
          const isDunkerquois = travel.homeport == 'Dunkerque';
          if (isDunkerquois && flagGroupFilters.includes('dunkerquois')) {
            accept = true;
          }
          else if (groupStrangers) {
            const group = travel.flag_fr === 'français' ? 'français' : 'étranger';
            accept = flagGroupFilters.includes(group);
          } else {
            accept = flagGroupFilters.includes(travel.flag_fr);
          }
        }
        return accept;
      }
    });
    // create groups
    let maxPossibleTonnageTemp = -Infinity;
    let groups = filteredTravels.reduce((res, travel) => {
      if (+travel.tonnage > maxPossibleTonnageTemp) {
        maxPossibleTonnageTemp = +travel.tonnage;
      }
      const isDunkerquois = travel.homeport == 'Dunkerque';
      let flagGroup;
      if (isDunkerquois) {
        flagGroup = 'dunkerquois';
      } else if (travel.flag_fr === 'français') {
        flagGroup = 'autres français'
      } else if (groupStrangers) {
        flagGroup = 'étranger'
      } else {
        flagGroup = travel.flag_fr;
      }
      flagGroup = translate('CarteDestinations', flagGroup, lang);
      // let flagGroup = isDunkerquois ? 'dunkerquois' : groupStrangers ? travel.flag_fr === 'français' ? 'français' : 'étranger' : travel.flag_fr;
      const destination = travel.destination;
      res.totalTonnage += +travel.tonnage;
      res.totalTravels = res.totalTravels + 1;
      if (!res.destinations[destination]) {
        res.destinations[destination] = {
          destination,
          travels: 0,
          tonnage: 0,
          latitude: travel.destination_latitude,
          longitude: travel.destination_longitude,
          flagGroups: {}
        }
      }
      res.destinations[destination].travels += 1;
      res.destinations[destination].tonnage += +travel.tonnage;
      if (!res.destinations[destination].flagGroups[flagGroup]) {
        res.destinations[destination].flagGroups[flagGroup] = {
          tonnage: 0,
          travels: 0
        }
       
      }
      res.destinations[destination].flagGroups[flagGroup].tonnage += +travel.tonnage;
      res.destinations[destination].flagGroups[flagGroup].travels += 1;
      return res;
    }, { destinations: {}, totalTonnage: 0, totalTravels: 0 })

    const destinationsArray = Object.values(groups.destinations);
    const maxDestinationTonnage = max(destinationsArray, d => d.tonnage);
    const minDestinationTonnage = min(destinationsArray, d => d.tonnage);
    const maxDestinationTravels = max(destinationsArray, d => d.travels);

    const vizData = {
      ...groups,
      minDestinationTonnage,
      maxDestinationTonnage,
      maxDestinationTravels,
      destinations: destinationsArray.sort((a, b) => {
        if (a.tonnage > b.tonnage) {
          return -1;
        } else {
          return 1;
        }
      })
    }

    return {
      maxPossibleTonnage: maxPossibleTonnageTemp,
      flagGroupModalities: Array.from(flagGroupModalitiesTemp).reverse(),
      vizData
    }
  }, [travels, minTonnage, maxTonnage, flagGroupFilters, groupStrangers, longCoursOnly, lang, translate]);

  const maxCircleArea = useMemo(() => {
    const maxDimension = max([width, height]);
    let maxObjectRadius = maxDimension * .03;
    if (projectionTemplate === 'World') {
      maxObjectRadius /= 3;
    }
    return Math.PI * maxObjectRadius * maxObjectRadius;
  }, [width, height, projectionTemplate]);


  return (
    <div
      className="CarteDestinations"
      style={{
        width,
        height: atlasMode ? window.innerHeight * .9 : height
      }}
    >
      <GeographicMapChart
        title={'Carte des destinations des navires partis de Dunkerque en 1789'}
        projectionTemplate={projectionTemplate}
        hideTitle={!atlasMode}
        layers={[
          // {
          //   type: 'svg',
          //   data: data.get('map_backmaxPossibleTonnagegrounds/world_map.svg'),//: data['map_backgrounds/map_france_1789.geojson'],
          //   animated: true
          // },
          {
            type: 'choropleth',
            animated: false,
            showAllParts: false,
            data: data.get('map_backgrounds/physical_world_map.geojson'),// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
            // data: data.get('map_backgrounds/physical_world_map_light.geojson'),// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
            // data: projectionTemplate.includes('France') ? data.get('map_backgrounds/physical_world_map.geojson') : data.get('map_backgrounds/physical_world_map_light.geojson'),// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
            // reverseColors: atlasMode ? undefined : true,
          },
          {
            type: 'custom',
            data: {
              vizData,
              maxCircleArea,
              flagGroupModalities,
              lang,
              highlightedDestination,
              setHighlightedDestination,
              containerWidth: width,
              containerHeight: height,
              showOffscreenPorts,
              showDetailsInMap,
            },
            renderObjects
          }
        ]}
        height={atlasMode ? window.innerHeight * .9 : height}
        width={width}
      />
      <Legend
        {
        ...{
          flagGroupModalities,
          flagGroupFilters,
          setFlagGroupFilters,
          filterOptions,
          groupStrangers,
          setGroupStrangers,

          showOffscreenPorts,
          showDetailsInMap,
          setShowOffscreenPorts,
          setShowDetailsInMap,

          maxDestinationTonnage: 10000,// vizData.maxDestinationTonnage,
          minDestinationTonnage: vizData.minDestinationTonnage,
          maxCircleArea,

          dominantMode: !highlightedDestination && !showDetailsInMap,

          longCoursOnly,
          setLongCoursOnly,
          maxPossibleTonnage,
          minTonnage,
          setMinTonnage,
          maxTonnage,
          setMinTonnage,
          setMaxTonnage,
          containerWidth: width,
          containerHeight: height,
          lang,
          atlasMode,
        }
        }
      />
      <div className={`projection-templates-container ${templatesVisible ? 'is-deployed' : 'is-collapsed'}`}>
        <p style={{ margin: 0, fontSize: 10, maxWidth: '15rem' }}>
          <i>
            {translate('CarteDestinations', 'click_cta', lang)}
          </i>
        </p>
        <h4
          className="projection-templates-title"
          onClick={() => {
            setTemplatesVisible(!templatesVisible)
          }}
        >
          <span>{translate('CarteDestinations', 'map_position', lang)}</span>
          <span className="templates-list-toggle">
            <button
            >
              ▶
            </button>
          </span>
        </h4>
        <ul>
          {
            [
              {
                id: 'from France to England',
                title: translate('CarteDestinations', 'map_position_fr_to_en', lang),
              },
              {
                id: 'France',
                title: translate('CarteDestinations', 'map_position_france', lang),
              },
              {
                id: 'world north',
                title: translate('CarteDestinations', 'map_position_world_north', lang),
              },
              {
                id: 'coast from Bretagne to Flandres',
                title: translate('CarteDestinations', 'map_position_flanders_britonny', lang),
              },
              {
                id: 'World',
                title: translate('CarteDestinations', 'map_position_world', lang),
              },
              {
                id: 'South Europe',
                title: translate('CarteDestinations', 'map_position_south_europe', lang),
              },
              {
                id: 'North Europe',
                title: translate('CarteDestinations', 'map_position_north_europe', lang),
              },
              
            ]
              .map(({ id, title }) => {
                return (
                  <li className={`projection-button-container ${id === projectionTemplate ? 'is-active' : ''}`} key={id}>
                    <button onClick={() => {
                      setProjectionTemplate(id);
                      setTemplatesVisible(false);
                    }}>
                      {title}
                    </button>
                  </li>
                )
              })
          }
        </ul>
      </div>
      <ReactTooltip id="destinations-tooltip" />
    </div>
  )
}