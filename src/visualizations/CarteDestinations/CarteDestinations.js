import React, { useEffect, useMemo, useState } from "react";

import GeographicMapChart from "../../components/GeographicMapChart";

import SliderRange from '../../components/SliderRange';

import renderObjects from './renderObjects';

import {max} from 'd3-array';

import './CarteDestinations.scss';

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
    ...props
}) {

    // states
    const [minTonnage, setMinTonnage] = useState(minTonnageFromProps);
    const [maxTonnage, setMaxTonnage] = useState(maxTonnageFromProps);
    const [groupStrangers, setGroupStrangers] = useState(groupStrangersFromProps);
    const [longCoursOnly, setLongCoursOnly] = useState(longCoursOnlyFromProps);
    const [flagGroupFilters, setFlagGroupFilters] = useState(flagGroupFiltersFromProps);
    const [projectionTemplate, setProjectionTemplate] = useState(projectionTemplateFromProps);
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
    

    const travels = data.get('destinations_from_dunkerque.csv') || [];
    const filterOptions = [
      {
        id: 'group_strangers',
        labels: {
          fr: 'Grouper les étrangers',
          en: 'Group strangers'
        }
      },
      {
        id: 'only_long_cours',
        labels: {
          fr: 'Trajets long-cours uniquement',
          en: 'Long-cours travels only'
        }
      },      
    ];

    const {maxPossibleTonnage = 1000, vizData, flagGroupModalities = []} = useMemo(() => {
      // filter relevant travels
      const flagGroupModalitiesTemp = new Set();
      const filteredTravels = travels.filter(travel => {
        const tonnage = +travel.tonnage;
        // list flag groups
        const isDunkerquois = travel.homeport == 'Dunkerque';
        let flagGroup = isDunkerquois ? 'dunkerquois' : groupStrangers ? travel.flag_fr === 'français' ? 'français': 'étranger' : travel.flag_fr;
        if (!flagGroupModalitiesTemp.has(flagGroup)) {
          flagGroupModalitiesTemp.add(flagGroup)
        }
        // first filter tonnage
        if(tonnage >= minTonnage && tonnage <= maxTonnage) {
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
              const group = travel.flag_fr === 'français' ? 'français': 'étranger';
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
        let flagGroup = isDunkerquois ? 'dunkerquois' : groupStrangers ? travel.flag_fr === 'français' ? 'français': 'étranger' : travel.flag_fr;
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
          res.destinations[destination].flagGroups[flagGroup].tonnage += +travel.tonnage;
          res.destinations[destination].flagGroups[flagGroup].travels += 1;
        }
        return res;
      }, {destinations: {}, totalTonnage: 0, totalTravels: 0})

      const destinationsArray = Object.values(groups.destinations);
      const maxDestinationTonnage = max(destinationsArray, d => d.tonnage);
      const maxDestinationTravels = max(destinationsArray, d => d.travels);

      const vizData = {
        ...groups,
        maxDestinationTonnage,
        maxDestinationTravels,
        destinations: destinationsArray
      }

      return {
        maxPossibleTonnage: maxPossibleTonnageTemp,
        flagGroupModalities: Array.from(flagGroupModalitiesTemp),
        vizData
      }
    }, [travels, minTonnage, maxTonnage, flagGroupFilters, groupStrangers, longCoursOnly]);

    
    const maxCircleArea = useMemo(() => {
      const maxDimension = max([width, height]);
      const maxObjectRadius = maxDimension * .05;
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
              data: {vizData, maxCircleArea, flagGroupModalities},
              renderObjects
            }
          ]}
          height={atlasMode ? window.innerHeight * .9 : height}
          width={width}
        />
        <div className="legend">
          <h3>Légende</h3>
          <div>
            <h4>Montrer les pavillons</h4>
            <ul>
              {
                flagGroupModalities
                .map(id => {
                  const isIncluded = flagGroupFilters.length ? flagGroupFilters.includes(id) : true
                  const handleClick = (e) => {
                    e.stopPropagation();
                    if (!flagGroupFilters.length) {
                      setFlagGroupFilters(flagGroupModalities.filter(f => f !== id).join(','));
                    // remove
                    } else if (isIncluded) {
                      setFlagGroupFilters(flagGroupFilters.split(',').filter(i => i !== id).join(','));
                    // add
                    } else{
                      setFlagGroupFilters(`${flagGroupFilters},${id}`);
                    }
                  }
                  return (
                    <li key={id}>
                      <input onClick={handleClick} type="checkbox" checked={isIncluded} readOnly />
                     <label>{id}</label>
                    </li>
                  )
                })
              }
            </ul>
          </div>
          <div>
            <h4>Options</h4>
            <ul>
            {
              filterOptions.map(({id, labels}) => {
                let checked = false;
                switch (id) {
                  case 'group_strangers':
                    checked = groupStrangers;
                    break;
                  case 'only_long_cours':
                  default:
                    checked = longCoursOnly;
                    break;
                }
                const handleClick = (e) => {
                  e.stopPropagation();
                  switch(id) {
                    case 'group_strangers':
                      setGroupStrangers(!groupStrangers);
                      setFlagGroupFilters('');
                      break;
                    case 'only_long_cours':
                    default:
                      setLongCoursOnly(!longCoursOnly)
                      break;
                  }
                }
                return (
                  <li key={id}>
                    <input onClick={handleClick} type="checkbox" checked={checked} readOnly />
                    <label>{labels[lang]}</label>
                  </li>
                )
              })
            }
            </ul>
          </div>
          <div>
            <h4>Montrer les tonnages</h4>
            <div className="slider-container">
              <SliderRange
                min={0}
                max={maxPossibleTonnage}
                value={[minTonnage, maxTonnage]}
                onChange={([newMin, newMax]) => {
                  setMinTonnage(newMin);
                  setMaxTonnage(newMax);
                }}
              />
            </div>
          </div>
          
        </div>
      </div>
    )
}