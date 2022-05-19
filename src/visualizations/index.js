import { useMemo } from 'react';

import SmogglagePortsStats from './SmogglagePortsStats';
import SmogglageStatus from './SmogglageStatus';
import PecheTypeValue from './PecheTypeValue';
import MapDunkerquePort from './MapDunkerquePort';
/**
 * This script is the bridge between visualization code, visualizations list, and visualization callers in contents.
 * It returns a visualization component depending on the provided id
 * @param {string} id
 * @param {String} props.displayedVizId
 * @param {Object} props.data
 * @param {object} props.dimensions
 * @returns {React.ReactElement} - React component
 */
export default function VisualizationController({
    vizId,
    data,
    ref,
    dimensions,
    lang,
    callerProps = {}
}) {
    const vizContent = useMemo(() => {
        switch (vizId) {
            case 'peche-type-value':
                return (
                    <PecheTypeValue {...{ data, dimensions, lang }} />
                );
            case 'smoggleur-statut':
                return (
                    <SmogglageStatus {...{ data, dimensions, lang }} />
                );
            case 'smoggleur-proportion':
                return (
                    <SmogglagePortsStats {...{ data, dimensions, lang }} />
                );
            case 'map':
                return (
                    <MapDunkerquePort {...{ data, dimensions, callerProps }} />
                );
            default:
                return <>Visualizations manquante</>
        }
    }, [vizId, callerProps, dimensions, lang, data])

    return (
        <div
            className='VisualizationController viz-render'
            ref={ref}
            style={{
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {vizContent}
        </div>
    )
}