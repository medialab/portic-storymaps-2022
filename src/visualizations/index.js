import React, { useMemo } from 'react';

import visualizationsMetas from '../data/viz';

import SmogglagePortsStats from './SmogglagePortsStats';
import PecheTypeValue from './PecheTypeValue';
import HistoireDunkerque from './HistoireDunkerque';
import FraudeExportDunkerque from './FraudeExportDunkerque';
import StigmatesSmoggleursDunkerque from './StigmatesSmoggleursDunkerque';

/**
 * This script is the bridge between visualization code, visualizations list, and visualization callers in contents.
 * It returns a visualization component depending on the provided id
 * @param {string} id
 * @param {String} props.focusedVizId
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
    const { width, height } = dimensions;

    const vizContent = useMemo(() => {
        switch (vizId) {
            case 'peche-type-value':
                return (
                    <PecheTypeValue {...{ data, dimensions, lang }} />
                );
            case 'smoggleur-proportion':
                return (
                    <SmogglagePortsStats {...{ data, dimensions, lang }} />
                );
            case 'histoire-dunkerque':
                return (
                    <HistoireDunkerque {...{ data, dimensions, callerProps }} />
                );
            case 'stigmates-smoggleurs-dunkerque':
                return (
                    <StigmatesSmoggleursDunkerque {...{ data, dimensions }} />
                );
            case 'fraude-exports-dunkerque':
                return (
                    <FraudeExportDunkerque {...{ data, dimensions }} />
                );
            default:
                return (
                    <img
                        src={`${process.env.BASE_PATH}/assets/${vizId}.png`}
                        {...{ width, height }}
                        style={{ objectFit: 'contain' }}
                    />
                )
        }
    }, [vizId, callerProps, dimensions, lang, data])

    return (
        <div className='VisualizationController viz-render' ref={ref}>
            {vizContent}
        </div>
    )
}