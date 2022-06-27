import { min } from "d3-array";
import { scaleLinear } from "d3-scale";
import { useMemo, useState } from "react";

import Destination from './Destination';

const renderObjects = ({
  data, 
  projection,
  width,
  height
}) => {
  const [selectedDestination, setSelectedDestination] = useState()
  const {vizData, maxCircleArea, flagGroupModalities} = data;
  const {destinations: initialDestinations, maxDestinationTonnage} = vizData;
  const {areaScale, fontSizeScale} = useMemo(() => {
    const newAreaScale = scaleLinear().domain([0, maxDestinationTonnage]).range([0, maxCircleArea]);
    const newFontSizeScale = scaleLinear().domain([0, maxDestinationTonnage]).range([4, 12]);
    return {
      areaScale: newAreaScale,
      fontSizeScale: newFontSizeScale
    }
  }, [maxDestinationTonnage, maxCircleArea]);


  const destinations = useMemo(() => {
    return initialDestinations.map(({longitude, latitude, tonnage, ...destination}) => {
      const [initialX, initialY] = projection([longitude, latitude]);
      const area = areaScale(tonnage);
      const fontSize = fontSizeScale(tonnage);
      const radius = Math.sqrt((area / Math.PI));
      let x = initialX,
      y = initialY;
      let overflowing = false;
      const margin = 10;
      let arrowDirection = '';
      if (y < 0) {
        y = margin + radius;
        overflowing = true;
        arrowDirection += 'top';
      } else if (y > height) {
        y = height - margin - radius;
        overflowing = true;
        arrowDirection += 'bottom';
      }
      if (x < 0) {
        x = margin + radius;
        overflowing = true;
        arrowDirection += 'left'
      } else if (x > width) {
        x = width - margin - radius;
        overflowing = true;
        arrowDirection += 'right'
      }
      
      return {
        ...destination,
        tonnage,
        x,
        y,
        radius,
        fontSize,
        overflowing,
        arrowDirection,
      }
    })
  }, [initialDestinations, areaScale, fontSizeScale, projection])
  return (
    <>
      {
        destinations
        .sort((a, b) => {
          if (a.tonnage > b.tonnage) {
            return 1;
          }
          return -1;
        })
        .map((destination) => {
          const handleClick = () => {
            setSelectedDestination(destination.destination);
          }
          return (
            <Destination
              {...destination}
              {...{
                flagGroupModalities,
              }}
              key={destination.destination}
              onClick={handleClick}
            />
          )
        })
      }
      <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
        refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
    </>
  )
}

export default renderObjects;