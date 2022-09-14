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
  projectionTemplate: projectionTemplateFromProps = 'from France to England',
  minTonnage: minTonnageFromProps = 0,
  maxTonnage: maxTonnageFromProps = 1000,
  groupStrangers: groupStrangersFromProps = true,
  longCoursOnly: longCoursOnlyFromProps = false,
  flagGroupFilters: flagGroupFiltersFromProps = '',
  showOffscreenPorts: showOffscreenPortsFromProps = false,
  showDetailsInMap: showDetailsInMapFromProps = false,
  ...props
}) {

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
  const [highlightedDestination, setHighlightedDestination] = useState();

  // update state from props
  // @todo factorize that with a custom hook
  useEffect(() => {
    setMinTonnage(minTonnageFromProps);
  }, [minTonnageFromProps]);
  useEffect(() => {
    setMaxTonnage(maxTonnageFromProps);
  }, [maxTonnageFromProps]);
  useEffect(() => {
    setGroupStrangers(groupStrangersFromProps);
    setFlagGroupFilters('');
  }, [groupStrangersFromProps]);
  useEffect(() => {
    setLongCoursOnly(longCoursOnlyFromProps);
  }, [longCoursOnlyFromProps]);
  useEffect(() => {
    setFlagGroupFilters(flagGroupFiltersFromProps);
  }, [flagGroupFiltersFromProps]);
  useEffect(() => {
    setProjectionTemplate(projectionTemplateFromProps);
  }, [projectionTemplateFromProps]);

  useEffect(() => {
    setShowOffscreenPorts(showOffscreenPortsFromProps);
  }, [showOffscreenPortsFromProps]);

  useEffect(() => {
    setShowDetailsInMap(showDetailsInMapFromProps);
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
      if (!flagGroupModalitiesTemp.has(flagGroup)) {
        flagGroupModalitiesTemp.add(flagGroup)
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
      if (travel.tonnage > maxPossibleTonnageTemp) {
        maxPossibleTonnageTemp = travel.tonnage;
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
      flagGroupModalities: Array.from(flagGroupModalitiesTemp),
      vizData
    }
  }, [travels, minTonnage, maxTonnage, flagGroupFilters, groupStrangers, longCoursOnly]);


  const maxCircleArea = useMemo(() => {
    const maxDimension = max([width, height]);
    const maxObjectRadius = maxDimension * .03;
    return Math.PI * maxObjectRadius * maxObjectRadius;
  }, [width, height]);


  return (
    <div
      className="CarteDestinations"
      style={{
        width,
        height: atlasMode ? window.innerHeight * .9 : height
      }}
    >
      <GeographicMapChart
        title={'Carte des destinations des navires partis de Dunkerque'}
        projectionTemplate={projectionTemplate}
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
                title: 'De la France à l\'Angleterre',
              },
              {
                id: 'France',
                title: 'France',
              },
              {
                id: 'world north',
                title: 'Atlantique',
              },
              {
                id: 'coast from Bretagne to Flandres',
                title: 'De la Bretagne à la Flandre',
              },
              {
                id: 'World',
                title: 'Monde',
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