import { max, min } from "d3-array";
import { useMemo } from 'react';
import { scaleLinear } from "d3-scale";
import PortObject from "./PortObject";


const labelGroups = {
  'left': [
    'Wick',
    'Leith',
    'Dumbarton',
    'Greenock',
    'Glasgow',
    'Newcastle',
    'Sunderland',
    'Stockton',
    'Donaghadee',
    'Whitby',
    'Hull',
    'Saltfleet',
    'Mersey',
    'Liverpool',
    "King's Lynn",
    'Barmouth',
    "Southwold",
    'Neath',
    'Bristol',
    'Southampton',
    'Cork',
    'Kinsale',
    'Poole',
    'Lyme Regis',
    'Padstow',
    'Fowey',
    

    'Lee on Solent',
    'Portsmouth',
    'Cowes',
    'Dartmouth',
    'Plymouth',
  ],
  'bottom': [

    'Yarmouth',
    'Saint Helens',
    'Aurigny',
    'Guernesey',
    'Jersey',
    'Indéfini',
    'Chichester',
    'Arundel',
    'Storrington',
    'Shoreham',
    'Eastbourn',
    'Hasting',
    'Pett',
    'Dungeness',
  ],
  'right': [
    "Londres",
    "Barking",
    "Greenwich",
    "Woodbridge",
    "Ipswich",
    "Harwich",
    "Lawford",
    "Colchester",
    "Walton",
    "Brightlingsea",
    "Maldon",
    "Burnham",
    "Pagelsham",
    "Southend",
    "Gravesend",
    "Warden",
    "Rochester",
    "Burham",
    "Chatham",
    "Faversham",
    "Reculvers",
    "Herne Bay",
    "Whistable",
    "Margate",
    "Ramsgate",
    "Deal",
    "Douvres",
    "Folkestone",
    "Hythe",
    "Sandgate",
    "Rye",
    "Lydd",
  ]
}

const renderObjects = ({
  data,
  projection,
  width,
  height,

}) => {
  const {
    homeportsData,
    maxCircleArea,
    circleSizeVariable,
    selectedPort,
    setSelectedPort,
    onMouseOver,
    onMouseOut,
    highlightedPort,
    // lang,
  } = data;
  const maxSizeValue = useMemo(() => {
    return max(homeportsData.map(d => +d[circleSizeVariable]))
  }, [circleSizeVariable, homeportsData]);
  const minSizeValue = useMemo(() => {
    return min(homeportsData.map(d => +d[circleSizeVariable]))
  }, [circleSizeVariable, homeportsData])

  const { areaScale, fontSizeScale } = useMemo(() => {
    const newAreaScale = scaleLinear().domain([minSizeValue, maxSizeValue]).range([5, maxCircleArea]);
    const newFontSizeScale = scaleLinear().domain([minSizeValue, maxSizeValue]).range([8, 18]);
    return {
      areaScale: newAreaScale,
      fontSizeScale: newFontSizeScale
    }
  }, [circleSizeVariable, maxSizeValue]);

  const vizData = useMemo(() => {
    return homeportsData.map(({
      latitude,
      longitude,
      port,
      ...otherData
    }) => {
      const quantiField = +otherData[circleSizeVariable]
      const [x, y] = projection([+longitude, +latitude]);
      const area = areaScale(quantiField);
      const fontSize = fontSizeScale(quantiField);
      const radius = Math.sqrt((area / Math.PI));
      return {
        label: port,
        x,
        y,
        fontSize,
        radius
      }
    })
  }, [areaScale, fontSizeScale, circleSizeVariable, homeportsData, projection]);
  const vizDataMap = vizData.reduce((cur, p) => ({
    ...cur,
    [p.label]: p
  }), {});
  const donePorts = new Set();
  const objectsGroups = {
    left: labelGroups.left.map(label => {
      if (!vizDataMap[label]) {
        console.warn('no port ', label);
      } else {
        donePorts.add(label);
      }
      return vizDataMap[label];
    }).filter(p => p),
    right: labelGroups.right.map(label => {
      if (!vizDataMap[label]) {
        console.warn('no port ', label);
      } else {
        donePorts.add(label);
      }
      return vizDataMap[label];
    }).filter(p => p),
    bottom: labelGroups.bottom.map(label => {
      if (!vizDataMap[label]) {
        console.warn('no port ', label);
      } else {
        donePorts.add(label);
      }
      return vizDataMap[label];
    }).filter(p => p),
  }
  Object.keys(vizDataMap).forEach(label => {
    if (!donePorts.has(label)) {
      throw new Error(label + ' has no group so it wont be displayed !!')
    }
  })

  const rightRowHeight = height / 2 / objectsGroups.right.length;
  const leftRowHeight = height / 2 / objectsGroups.left.length;
  const bottomColumnWidth = width / objectsGroups.bottom.length * .9;
  const labelsFontSize = min([rightRowHeight, leftRowHeight, bottomColumnWidth]) * .7;
  return (
    <>
      {
        objectsGroups.right
          .map(({
            label,
            x,
            y,
            radius
          }, i) => {
            const isActive = label === selectedPort;
            return (
              <PortObject
                key={i}
                labelGroup='right'
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                {...{ label, x, y }}
                radius={isActive ? height * .33 : radius}
                fontSize={labelsFontSize}
                labelX={width - 50}
                labelY={i * rightRowHeight + height / 4}
                onSelect={port => setSelectedPort(port)}
                onDeselect={() => setSelectedPort()}
                isActive={isActive}
                isHidden={(selectedPort && !isActive)}
                isDimmed={(highlightedPort && label !== highlightedPort)}
              />
            )
          })
      }
      {
        objectsGroups.left
          .map(({
            label,
            x,
            y,
            radius
          }, i) => {
            const isActive = label === selectedPort;
            return (
              <PortObject
                key={i}
                labelGroup='left'
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                {...{ label, x, y }}
                radius={isActive ? height * .33 : radius}
                fontSize={labelsFontSize}
                labelX={50}
                labelY={i * leftRowHeight + height / 4}
                onSelect={port => setSelectedPort(port)}
                onDeselect={() => setSelectedPort()}
                isActive={isActive}
                isHidden={(selectedPort && !isActive)}
                isDimmed={(highlightedPort && label !== highlightedPort)}
              />
            )
          })
      }
      {
        objectsGroups.bottom
          .map(({
            label,
            x,
            y,
            radius
          }, i) => {
            const isActive = label === selectedPort;
            return (
              <PortObject
                key={i}
                labelGroup='bottom'
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                {...{ label, x, y }}
                radius={isActive ? height * .33 : radius}
                fontSize={labelsFontSize}
                labelX={i * bottomColumnWidth + width * 0.05}
                labelY={height - 20}
                onSelect={port => setSelectedPort(port)}
                onDeselect={() => setSelectedPort()}
                isActive={isActive}
                isHidden={(selectedPort && !isActive)}
                isDimmed={(highlightedPort && label !== highlightedPort)}
              />
            )
          })
      }
    </>
  )
}

export default renderObjects;