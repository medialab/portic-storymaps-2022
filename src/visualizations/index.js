import { useContext, useMemo } from 'react';

import SmogglagePortsStats from './SmogglagePortsStats';
import SmogglageStatus from './SmogglageStatus';

import visualizationsMetas from '../data/viz';

/**
 * This script is the bridge between visualization code, visualizations list, and visualization callers in contents.
 * It returns a visualization component depending on the provided id
 * @param {string} id
 * @param {String} props.focusedVizId
 * @param {Object} props.data
 * @param {object} props.dimensions
 * @returns {React.ReactElement} - React component
 */
export default function VisualizationController ({
    focusedVizId: vizId,
    data,
    ref,
    dimensions
}) {
    const {
        title
    } = Object.keys(visualizationsMetas)
        .map(vizId => visualizationsMetas[vizId])
        .find(viz => viz['id'] === vizId);

    const vizContent = useMemo(() => {
            switch (vizId) {
                case 'smoggleur-statut':
                    return (
                        <SmogglageStatus { ...{ title, data, dimensions } } />
                    );
                default:
                case 'smoggleur-proportion':
                    return (
                        <SmogglagePortsStats { ...{ title, data, dimensions } } />
                    );
            }
    }, [vizId])

    return (
        <div ref={ref}>
            {vizContent}
        </div>
    )
}