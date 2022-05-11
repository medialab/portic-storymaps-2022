import React, { useState, useContext } from 'react';
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
export default function VisualizationContainer ({
    ...props
}) {
    const { lang } = useParams();

    const [dimensions, setDimensions] = useState({
        width: 1000,
        height: 1000
    });
    /** @type {[Boolean, Function]} */
    const [isFullScreen, setIsFullScreen] = useState(false);

    function onClickToggleFullScreen () {
        setIsFullScreen(!isFullScreen);
    }

    if (isFullScreen) {
        return (
            <VisualizationFocus
                onClickClose={() => onClickToggleFullScreen()}
                {...props}
            />
        )
    }

    return (
        <Measure
            bounds
            onResize={contentRect => {
                setDimensions(contentRect.bounds)
            }}
        >
            {
                ({ measureRef }) => (
                    <div ref={measureRef} style={{ height: '100%' }}>
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
                                ...props
                            }
                        } />
                    </div>
                )
            }
        </Measure>
    )
}