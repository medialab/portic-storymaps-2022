import React, {useState, useContext} from 'react';
import omit from 'lodash/omit';
import cx from 'classnames';
import Measure from 'react-measure'

import VisualizationContainer from '../../visualizations/index.js';
import { VisualizationControlContext } from '../../utils/contexts';

/**
 * Controller preparing a given visualization for rendering (cleaning props, providing dimensions)
 * @param {object} activeVisualization - JSON data about the visualization to display
 * @param {string} lang
 * @param {boolean} atlasMode
 * @param {boolean} screenshotMode
 * @returns {React.ReactElement} - React component
 */
const VisualizationController = ({
  activeVisualization,
  lang,
  atlasMode,
  screenshotMode
}) => {
  const [dimensions, setDimensions] = useState({
    width: 1000,
    height: 1000
  });
  const visProps = activeVisualization && omit(activeVisualization, ['id', 'ref', 'visualizationId']);
  
  return (
    <Measure 
      bounds
      onResize={contentRect => {
        setDimensions(contentRect.bounds)
      }}
    >
      {({ measureRef }) => (
          <div ref={measureRef} className={cx("VisualizationController", {'is-empty': !activeVisualization})}>
          {/* <h2>Visualization controller</h2> */}
          {
            activeVisualization ?
            <>
              <VisualizationContainer 
                lang={lang} 
                screenshotMode={screenshotMode} 
                atlasMode={atlasMode} 
                id={atlasMode ? activeVisualization.id : activeVisualization.visualizationId} 
                {...visProps} 
                dimensions={dimensions} 
              />
            </>
            : null // <div>Pas de visualisation à afficher</div>
          }
  
        </div>
      )}
    </Measure>
  );
}

export default VisualizationController;