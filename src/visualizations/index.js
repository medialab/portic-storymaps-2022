import React, { useMemo } from 'react';

import visualizationsMetas from '../data/viz';

import SmogglagePortsStats from './SmogglagePortsStats';
import PecheTypeValue from './PecheTypeValue';
import HistoireDunkerque from './HistoireDunkerque';
import FraudeExportDunkerque from './FraudeExportDunkerque';
import StigmatesSmoggleursDunkerque from './StigmatesSmoggleursDunkerque';
import CarteDestinations from './CarteDestinations';
import EvolutionTypeConges from './EvolutionTypeConges';
import TonnageMoyenMois from './TonnageMoyenMois';
import EvolutionBudgetDunkerque from './EvolutionBudgetDunkerque';
import FraudeExportPortFranc from './FraudeExportPortFranc';

/**
 * This script is the bridge between visualization code, visualizations list, and visualization callers in contents.
 * It returns a visualization component depending on the provided id
 * @param {Object} props
 * @param {String} props.vizId
 * @param {Map} props.datasets
 * @param {React.Ref} props.ref
 * @param {Object} props.dimensions
 * @param {Number} props.dimensions.width
 * @param {Number} props.dimensions.height
 * @param {'fr'|'en'} props.lang
 * @param {Object} [props.callerProps={}]
 * @returns {React.ReactElement} - React component
 */
export default function VisualizationController({
    vizId,
    datasets,
    ref,
    dimensions,
    lang,
    callerProps = {},
    ...props
}) {
    const { width, height } = dimensions;

    const data = useMemo(function getVizDataFromId() {
        const { outputs: vizDataFiles = [] } = visualizationsMetas[vizId] || {};
        if (vizDataFiles.every(dataFile => datasets.has(dataFile)) === false) {
            return undefined;
        }
        if (vizDataFiles.length === 1) {
            return datasets.get(vizDataFiles[0]);
        }
        return datasets;
    }, [vizId, datasets]);

    const vizContent = useMemo(() => {
        if (data === undefined) {
            return <>Les données de cette visualisation n'ont pu être chargées.</>;
        }

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
                    <HistoireDunkerque {...{ data, dimensions, callerProps, lang }} />
                );
            case 'stigmates-smoggleurs-dunkerque':
                return (
                    <StigmatesSmoggleursDunkerque {...{ data, dimensions, lang }} />
                );
            case 'fraude-exports-dunkerque':
                return (
                    <FraudeExportDunkerque {...{ data, dimensions, lang }} />
                );
            case 'fraude-exports-ports-francs':
                return (
                    <FraudeExportPortFranc {...{ data, dimensions, lang }} />
                );
            case 'evolution-budget-dunkerque':
                return (
                    <EvolutionBudgetDunkerque {...{ data, dimensions, lang }} />
                );
            case 'evolution-type-conges':
                return (
                    <EvolutionTypeConges {...{ data, dimensions, lang }} />
                );
            case 'tonnage-moyen-par-mois':
                return (
                    <TonnageMoyenMois {...{ data, dimensions, lang }} />
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
        <div onClick={e => e.stopPropagation()} className='VisualizationController viz-render' ref={ref}>
            {vizContent}
        </div>
    )
}