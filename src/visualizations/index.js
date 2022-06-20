import React, { useMemo } from 'react';

import visualizationsMetas from '../data/viz';

import SmogglagePortsStats from './SmogglagePortsStats';
import PecheTypeValue from './PecheTypeValue';
import HistoireDunkerque from './HistoireDunkerque';
import FraudeExportDunkerque from './FraudeExportDunkerque';
import StigmatesSmoggleursDunkerque from './StigmatesSmoggleursDunkerque';
import EvolutionBudgetDunkerque from './EvolutionBudgetDunkerque/EvolutionBudgetDunkerque';
import CarteDestinations from './CarteDestinations';

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
    callerProps = {},
    ...props
}) {
    const { width, height } = dimensions;

    const vizContent = useMemo(() => {
        switch (vizId) {
            case 'carte-destinations':
              return <CarteDestinations {...{data, dimensions, lang, ...props}} />;
            case 'peche-type-value':
                return (
                    <PecheTypeValue {...{ data, dimensions, lang, ...props }} />
                );
            case 'smoggleur-proportion':
                return (
                    <SmogglagePortsStats {...{ data, dimensions, lang, ...props }} />
                );
            case 'histoire-dunkerque':
                return (
                    <HistoireDunkerque {...{ data, dimensions, callerProps, ...props }} />
                );
            case 'stigmates-smoggleurs-dunkerque':
                return (
                    <StigmatesSmoggleursDunkerque {...{ data, dimensions, ...props }} />
                );
            case 'fraude-exports-dunkerque':
                return (
                    <FraudeExportDunkerque {...{ data, dimensions, ...props }} />
                );
            case 'evolution-budget-dunkerque':
                return (
                    <EvolutionBudgetDunkerque {...{ data, dimensions, ...props }} />
                );
            default:
                return (
                    <img
                        src={`${process.env.BASE_PATH}/assets/${vizId}.jpg`}
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