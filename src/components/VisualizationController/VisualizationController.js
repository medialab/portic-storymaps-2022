import React, { useState, useContext } from 'react';
import omit from 'lodash/omit';
import cx from 'classnames';
import Measure from 'react-measure'

import VisualizationContainer from '../../visualizations/index.js';
import { VisualizationControlContext } from '../../utils/contexts';

import visualizationsMetas from '../../data/viz';

/**
 * Controller preparing a given visualization for rendering (cleaning props, providing dimensions)
 * @param {Object} props
 * @param {String} props.focusedVizId
 * @param {Object} props.data
 * @returns {React.ReactElement} - React component
 */
export default function VisualizationController({
    focusedVizId,
    data
}) {
    console.log(data);

    // useEffect(() => {
    //   if (focusedVizId === null) { return; }

    //   let {
    //       titre_fr,
    //       description_fr,
    //       description_en,
    //       comment_lire_fr,
    //       comment_lire_en,
    //       outputs
    //   } = Object.keys(visualizationsMetas)
    //       .map(vizId => visualizationsMetas[vizId])
    //       .find(viz => viz['id'] === focusedVizId);

    //   outputs = outputs.map(csvFile => data[csvFile]);
    // }, [focusedVizId]);

    return (
        <pre>
            <code>
                {focusedVizId}
            </code>
        </pre>
    )
}