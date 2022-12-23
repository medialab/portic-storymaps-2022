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
import PecheMap from './PecheMap';
import Pilotage from './Pilotage/Pilotage';
import CommentedImage from '../components/CommentedImage';
import TreemapChart from '../components/TreemapChart';
import TonnageF12 from './TonnageF12';
import EstimationParTonnageDk from './EstimationParTonnageDk';
import ComparaisonProjectionDestinationProduitsColoniauxDk from './ComparaisonProjectionDestinationProduitsColoniauxDk';
import DestinationsDkPrProjection from './DestinationsDkPrProjection';
import ValeurParTonneau from './ValeurParTonneau/ValeurParTonneau';
import ExportsFr1787 from './ExportsFr1787/ExportsFr1787';
import EstimationImportsExports from './EstimationImportsExports/EstimationImportsExports';

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
  callerProps = undefined,
  atlasMode,
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
        return <CarteDestinations {...{ data, dimensions, lang, ...props }} />;
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
      case 'peche-map':
        return (
          <PecheMap {...{ data, dimensions, lang }} />
        );
      case 'pilotage':
        return (
          <Pilotage {...{ data, dimensions, lang, atlasMode }} />
        );
      case 'gravure-smoggleurs':
        const legend = {
          fr: `**Dany Guillou-Beuzit, Jacques Cambry,** voyage dans le Finistère ou état de ce département en 1794 et 1795, **Rennes, PUR, 2011 (dessin de Dany Guillou-Beuzit d’après le texte de Cambry)**`
        }
        return (
          <CommentedImage
            src={`${process.env.BASE_PATH}/assets/${vizId}.jpg`}
            width={width}
            height={height}
            legend={legend[lang]}
          />
        );
      case 'homeports-from-dunkerque':
        return (
          <TreemapChart
            {
            ...{
              data,
              width: dimensions.width,
              height: dimensions.height,
              lang,
              title: 'Parts des ports d\'attache pour les navires au départ de Dunkerque en 1789',
              tooltip: d => `${d.tonnage} tx de bateaux partis de Dunkerque étaient rattachés au port de ${d.homeport_fr} (${d.homeport_state_fr})`,
              // tooltip: d => translate('partie-1-ports-dattache', 'tooltip', props.lang, { 
              //   tonnage: formatNumber(d.tonnage), 
              //   homeport: d[`homeport_${props.lang}`], 
              //   category: props.lang === 'fr' ? d.category_2 : d.category_2_en 
              // }),
              fieldsHierarchy: ['state_category', 'homeport', 'homeport_state_fr'],
              color: {
                field: lang === 'fr' ? 'homeport_state_fr' : 'homeport_state_en',
                // palette: props.lang === 'fr' ? colorPalettes.portsTreemaps :  colorPalettes.portsTreemapsEn
              },
              leaf: {
                labelField: 'homeport_' + lang,
                countField: 'tonnage'
              }
            }
            }
          />
        );
      case 'tonnages-1787-f12':
        return <TonnageF12 {...{data, width, height, lang}} />;
      case 'valeur-par-tonneau':
        return <ValeurParTonneau {...{data, width, height, lang}}  />
      case 'destinations-dk-pour-projection':
        return <DestinationsDkPrProjection {...{data, width, height, lang}} />
      case 'estimation-par-destination-dk':
        return <EstimationParTonnageDk {...{data, width, height, lang}} />
      case 'comparaison-projection-destination-produits-coloniaux-dk':
        return <ComparaisonProjectionDestinationProduitsColoniauxDk {...{data, width, height, lang}} />
      case 'exports-fr-1787':
        return <ExportsFr1787 {...{data, width, height, lang}} />;
      case 'estimation-imports-exports':
        return <EstimationImportsExports {...{data, width, height, lang}} />;
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