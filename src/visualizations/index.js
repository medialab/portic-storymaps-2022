import { useContext, useMemo } from 'react';

import SmogglagePortsStats from './SmogglagePortsStats';
import SmogglageStatus from './SmogglageStatus';
import PecheTypeValue from './PecheTypeValue';
import MapDunkerquePort from './MapDunkerquePort';

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
    dimensions,
    lang,
    callerProps
}) {
    const title = useMemo(() => {
        const vizMetas = visualizationsMetas[vizId];
        return vizMetas[`titre_${lang}`]
    }, [vizId, lang]);

    const vizContent = useMemo(() => {
            switch (vizId) {
                case 'peche-type-value':
                    return (
                        <PecheTypeValue { ...{ title, data, dimensions, lang } } />
                    );
                case 'smoggleur-statut':
                    return (
                        <SmogglageStatus { ...{ title, data, dimensions, lang } } />
                    );
                default:
                case 'smoggleur-proportion':
                    return (
                        <SmogglagePortsStats { ...{ title, data, dimensions, lang } } />
                    );
                case 'map':
                    return (
                        <MapDunkerquePort { ...{ title, data, dimensions } } />
                    );
            }
    }, [vizId, callerProps, dimensions, lang, data, title])

    return (
        <div className='VisualizationController viz-render' ref={ref}>
            {vizContent}
        </div>
    )
}