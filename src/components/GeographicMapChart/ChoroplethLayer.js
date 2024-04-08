import { geoPath } from "d3-geo";
import { generatePalette } from '../../utils/misc';
import { uniq } from 'lodash';
import cx from 'classnames';
import { useSpring, useTransition, animated } from 'react-spring'
import { useEffect, useState, useMemo } from "react";
import ReactTooltip from "react-tooltip";

/**
 * Description
 * @param {string} d
 * @param {function} projection
 * @param {function} project
 * @param {object} palette
 * @param {object} layer
 * @param {number} width
 * @param {number} height
 * @returns {React.ReactElement} - React component
 */
const GeoPart = ({
  d: initialD,
  // projection,
  project,
  palette,
  layer,
  width,
  height,
  animated: isAnimated
}) => {

  // // @todo do this cleanly (removing out of bound objects to improve performance)
  // const boundsAbs = geoPath().bounds(initialD);
  // const [[x1, y1], [x2, y2]] = [projection(boundsAbs[0]), projection(boundsAbs[1])];
  // const [xMin, xMax] = [x1, x2].sort((a, b) => {
  //   if (a > b) return 1;
  //   return -1;
  // });
  // const [yMin, yMax] = [y1, y2].sort((a, b) => {
  //   if (a > b) return 1;
  //   return -1;
  // });
  // const outOfBounds = (isNaN(xMin) || isNaN(xMax) || isNaN(yMin) || isNaN(yMax)) ? false : xMin > width || yMin > height || xMax < 0 || yMax < 0;


  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true)
    })
  }, [])

  let currentD = project(initialD);

  // @todo this is awful but no time & need to move forward
  if (initialD.properties.identifiant == 'Shetlands') {
    currentD = currentD.split('Z').reverse().pop() + 'Z';
  }

  const animationProps = useSpring({
    to: {
      d: currentD
    },
    immediate: !isInited,
    config: {
      duration: 500,
    }
  });

  // if (initialD.properties.identifiant == 'Shetlands') {
  //   console.log(currentD, initialD)
  // }


  useEffect(() => {
    ReactTooltip.rebuild();
  });
  // if (outOfBounds) {
  //   return null;
  // }
  const id = initialD.properties.id || initialD.properties.shortname || initialD.properties.identifiant;
  // if (!id) {
  //   return null;
  // }
  if (!isAnimated) {
    return (
      <path
        title={initialD.properties.shortname}
        d={currentD}
        className="geopart"
        id={`geopart-${id}`}
        data-tip={layer.tooltip ? layer.tooltip(initialD) : undefined}
        data-for="geo-tooltip"
        style={{
          fill: layer.color !== undefined && palette !== undefined ? palette[initialD.properties[layer.color.field]] : 'transparent'
        }}
      />
    )
  }
  if (!id) {
    return null;
  }
  return (
    <animated.path
      title={initialD.properties.shortname}
      d={animationProps.d}
      className="geopart"
      id={`geopart-${id}`}
      data-tip={layer.tooltip ? layer.tooltip(initialD) : undefined}
      data-for="geo-tooltip"
      style={{
        fill: layer.color !== undefined && palette !== undefined ? palette[initialD.properties[layer.color.field]] : 'transparent'
      }}
    />
  )

}


// @TODO : mettre en place une palette de couleurs quantitative 

const ChoroplethLayer = ({
  layer,
  projection,
  width,
  height,
  reverseColors,
  showAllParts = false,
}) => {
  let palette;
  const project = useMemo(() => geoPath().projection(projection), [projection]);


  if (!layer.data) {
    console.info('no data for layer:', layer);
    return null;
  }

  if (layer.data.features && layer.color && layer.color.field) {
    // colors palette building
    const colorValues = uniq(layer.data.features.map(datum => datum.properties[layer.color.field]));
    if (layer.color.palette) { // if palette given in parameters we use it, otherwise one palette is generated
      palette = layer.color.palette;
    } else if (layer.color.generatedPalette) {
      const colors = generatePalette('map', layer.data.features.length);
      palette = colorValues.reduce((res, key, index) => ({
        ...res,
        [key]: colors[index]
      }), {});
    }
  }
  const partsData = useMemo(() => layer.data.features
    .filter(d => d.geometry)
    .filter(d => {
      if (showAllParts) {
        return true;
      }
      // @todo do this cleanly (removing out of bound objects to improve performance)
      const boundsAbs = geoPath().bounds(d);
      const [[x1, y1], [x2, y2]] = [projection(boundsAbs[0]), projection(boundsAbs[1])];
      const [xMin, xMax] = [x1, x2].sort((a, b) => {
        if (a > b) return 1;
        return -1;
      });
      const [yMin, yMax] = [y1, y2].sort((a, b) => {
        if (a > b) return 1;
        return -1;
      });
      const outOfBounds = (isNaN(xMin) || isNaN(xMax) || isNaN(yMin) || isNaN(yMax)) ? false : xMin > width || yMin > height || xMax < 0 || yMax < 0;
      return !outOfBounds;
    })
    , [projection, layer.data]);

  const [transitions, api] = useTransition(
    partsData
    , () => ({
      from: { opacity: 1 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
      config: {
        duration: 1000
      }
    }));
  return (
    <>
      <g className={cx("ChoroplethLayer", layer.className, { 'reverse-colors': reverseColors })}>
        {layer.animated ?
          transitions((style, d) => {
            const id = d.properties.id || d.properties.name || d.properties.identifiant;
            return (
              <animated.g className="geopart-container animated" style={style}>
                <GeoPart
                  key={id}
                  {...{
                    projection,
                    project,
                    palette,
                    layer,
                    d,
                    width,
                    height,
                    animated: true
                  }}
                />
              </animated.g>
            )

          })
          :
          partsData.map((d, index) => {
            const id = d.properties.id || d.properties.name || d.properties.identifiant || index;
            return (
              <g className="geopart-container static" title={id}>
              <GeoPart
                key={id}
                {...{
                  projection,
                  project,
                  palette,
                  layer,
                  d,
                  width,
                  height,
                  animated: false
                }}
              />
            </g>
            )
          })
          
          // partsData
          // .map((d, i) => {
          //   return (
          //     <GeoPart 
          //       key={d.properties.id || d.properties.name || i} 
          //       {...{
          //         projection, 
          //         project, 
          //         palette, 
          //         layer, 
          //         d, 
          //         width, 
          //         height, 
          //         animated: layer.animated
          //       }}
          //     />
          //   )
          // })
        }
      </g>
    </>
  );

}

export default ChoroplethLayer;