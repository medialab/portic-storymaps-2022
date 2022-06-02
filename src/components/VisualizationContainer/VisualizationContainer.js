import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import omit from 'lodash/omit';
import cx from 'classnames';
import Measure from 'react-measure'

import VisualizationFocus from '../../components/VisualizationFocus';

import VisualizationController from '../../visualizations/index.js';

import { VisualizationControlContext } from '../../utils/contexts';
import { SettingsContext } from '../../utils/contexts';

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
    resetVizProps,
    ...props
}) {
    const { lang } = useParams();

    const title = useMemo(() => {
        const vizMetas = visualizationsMetas[vizId];
        return vizMetas[`titre_${lang}`]
    }, [vizId, lang]);

    const [dimensions, setDimensions] = useState({
        width: -1,
        height: -1
    });
    /** @type {[Boolean, Function]} */
    const [isFullScreen, setIsFullScreen] = useState(false);

    function onClickToggleFullScreen() {
        setIsFullScreen(!isFullScreen);
    }

    if (isFullScreen) {
        return (
            <VisualizationFocus
                onClickClose={() => onClickToggleFullScreen()}
                vizId={vizId}
                {...props}
            />
        )
    }

    return (
        <>
            <button
                onClick={resetVizProps}
                style={{
                    visibility: (canResetVizProps === true) ? 'visible' : 'hidden'
                }}
            >
                Revenir à l'original
            </button>
            <h3>{title}</h3>
            <Measure
                bounds
                onResize={contentRect => {
                    const { width, height, top } = contentRect.bounds;
                    setDimensions({
                        width,
                        height: height - top
                    })
                }}
            >
                {
                    ({ measureRef }) => (
                        <div className='VisualizationContainer' ref={measureRef} style={{ height: '100%' }}>
                            <div className="fullscreen-viz-toggle-container">
                                <button
                                    data-for='contents-tooltip'
                                    data-tip="plus d'informations sur cette visualisation"
                                    onClick={() => onClickToggleFullScreen()}
                                >
                                    <span>+</span>
                                </button>
                            </div>

                            <VisualizationController {
                                ...{
                                    dimensions,
                                    lang,
                                    vizId,
                                    ...props
                                }
                            } />
                        </div>
                    )
                }
            </Measure>
        </>
    )
}