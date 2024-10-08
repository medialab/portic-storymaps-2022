import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Measure from 'react-measure'

import translate from '../../utils/translate';


import VisualizationController from '../../visualizations/index.js';

import visualizationsMetas from '../../data/viz';

/**
 * Controller preparing a given visualization for rendering (cleaning props, providing dimensions)
 * @param {Object} props
 * @param {String} props.focusedVizId
 * @param {Object} props.data
 * @returns {React.ReactElement} - React component
 */
export default function VisualizationContainer({
  displayedVizId: vizId,
  canResetVizProps,
  callerProps,

  onClickToggleFullScreen,
  introMode,

  resetVizProps,
  ...props
}) {
  const { lang } = useParams();
  const titleRef = useRef(null);
  // const titleHeight = titleRef.current ? titleRef.current.getBoundingClientRect().height : 0;

  const title = useMemo(() => {
    const vizMetas = visualizationsMetas[vizId];
    return vizMetas ? vizMetas[`titre_${lang}`] : '';
  }, [vizId, lang]);

  const [dimensions, setDimensions] = useState({
    width: -1,
    height: -1
  });

  /** @type {[Boolean, Function]} */
  function handleClickToggleFullScreen() {
    onClickToggleFullScreen();
  }
  return (
    <>
      {!introMode && 
        <h3 ref={titleRef}>
          <div className="viz-title">{title}</div>
          <div className="option-buttons-container">
                  <button
                    data-for='contents-tooltip'
                    data-tip={translate('vizContainer', 'goToFullScreen', lang)}
                    className="fullscreen-toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickToggleFullScreen();
                    }}
                  >
                    <span>+</span>
                  </button>
                  <button
                    onClick={resetVizProps}
                    className="reset-viz-props-btn"
                    data-for='contents-tooltip'
                    data-tip={translate('vizContainer', 'backToMainViz', lang)}
                    style={{
                      display: (canResetVizProps === true) ? 'flex' : 'none',
                    }}
                  >
                    <span>+</span>
                  </button>
                </div>
        </h3>}
      <Measure
        bounds
        onResize={contentRect => {
          const { width, height, top } = contentRect.bounds;
          
          setDimensions({
            width,
            height //introMode === true ? height : height - top
          })
        }}
      >
        {
          ({ measureRef }) => (
            <div className='VisualizationContainer' ref={measureRef}>
              {/*
                !introMode &&
                <div className="option-buttons-container">
                  <button
                    data-for='contents-tooltip'
                    data-tip={translate('vizContainer', 'goToFullScreen', lang)}
                    className="fullscreen-toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickToggleFullScreen();
                    }}
                  >
                    <span>+</span>
                  </button>
                  <button
                    onClick={resetVizProps}
                    className="reset-viz-props-btn"
                    data-for='contents-tooltip'
                    data-tip={translate('vizContainer', 'backToMainViz', lang)}
                    style={{
                      display: (canResetVizProps === true) ? 'flex' : 'none',
                    }}
                  >
                    <span>+</span>
                  </button>
                </div>
              */}


              <VisualizationController
                {
                ...{
                  dimensions,
                  lang,
                  vizId,
                  callerProps,
                  ...props
                }
                }
              />
            </div>
          )
        }
      </Measure>
    </>
  )
}