import React, { useMemo } from 'react';

import visualizationsMetas from '../data/viz';

import { formatNumber } from '../utils/misc';

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
import ComparaisonsLaRochelle from './ComparaisonsLaRochelle';
import Intro from './Intro/Intro';
import ExportsVsSmogglage from './ExportsVsSmogglage/ExportsVsSmogglage';
import PrixSmogglageGeneral from './PrixSmogglageGeneral';
import SmogglageStatus from './SmogglageStatus';
import HomeportSmoggleurs from './HomeportSmoggleurs';
import DepartsFrVersAngleterre from './DepartsFrVersAngleterre';
import DestinationsGbVersGb from './DestinationsGbVersGb';
import SchemaSources from './SchemaSources';
import ResumeActivitesDunkerquois from './ResumeActivitesDunkerquois';
import ImportsDunkerqueVsPortsFrancs from './ImportsDunkerqueVsPortsFrancs';

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
        return <CarteDestinations {...{ data, dimensions, lang, atlasMode, ...props }} />;
      case 'peche-type-value':
        return (
          <PecheTypeValue {...{ data, dimensions, lang, atlasMode, ...props }} />
        );
      case 'smoggleur-proportion':
        return (
          <SmogglagePortsStats {...{ data, dimensions, lang, atlasMode, ...props }} />
        );
      case 'histoire-dunkerque':
        return (
          <HistoireDunkerque {...{ data, dimensions, callerProps, atlasMode, lang }} />
        );
      case 'stigmates-smoggleurs-dunkerque':
        return (
          <StigmatesSmoggleursDunkerque {...{ data, dimensions, atlasMode, lang }} />
        );
      case 'fraude-exports-dunkerque':

        return (
          <FraudeExportDunkerque {...{ data, dimensions, atlasMode, lang }} />
        );
      case 'fraude-exports-ports-francs':
        let showPorts;
        if (callerProps && callerProps.showports) {
          showPorts = callerProps.showports.split(',').map(p => p.trim());
        }

        return (
          <FraudeExportPortFranc {...{ data, dimensions, atlasMode, lang, showPorts }} />
        );
      case 'evolution-budget-dunkerque':
        return (
          <EvolutionBudgetDunkerque {...{ data, dimensions, atlasMode, lang }} />
        );
      case 'evolution-type-conges':
        return (
          <EvolutionTypeConges {...{ data, dimensions, atlasMode, lang }} />
        );
      case 'tonnage-moyen-par-mois':
        return (
          <TonnageMoyenMois {...{ data, dimensions, lang, atlasMode }} />
        );
      case 'evolution-peche':
        return (
          <PecheMap {...{ data, dimensions, lang, atlasMode }} />
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
              atlasMode,
              lang,
              title: `onnage agrégé des navires partis de Dunkerque en 1789, par port d’attache`,
              tooltip: d => `En 1789, ${formatNumber(parseInt(d.tonnage))} tx de bateaux partis de Dunkerque étaient rattachés au port de ${d.homeport_fr} (${d.homeport_state_fr})`,
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
                countField: 'tonnage',
                labelFormat: d => `${d['homeport_' + lang]} (${formatNumber(parseInt(d.tonnage))} tx)`
              }
            }
            }
          />
        );
      case 'tonnages-1787-f12':
        return <TonnageF12 {...{ data, width, height, atlasMode, lang }} />;
      case 'valeur-par-tonneau':
        return <ValeurParTonneau {...{ data, width, height, atlasMode, lang }} />
      case 'destinations-dk-pour-projection':
        return <DestinationsDkPrProjection {...{ data, width, height, atlasMode, lang }} />
      case 'estimation-par-destination-dk':
        return <EstimationParTonnageDk {...{ data, width, height, atlasMode, lang }} />
      case 'comparaison-projection-destination-produits-coloniaux-dk':
        return <ComparaisonProjectionDestinationProduitsColoniauxDk {...{ data, width, height, atlasMode, lang }} />
      case 'exports-fr-1787':
        return <ExportsFr1787 {...{ data, width, height, atlasMode, lang }} />;
      case 'estimation-imports-exports':
        return <EstimationImportsExports {...{ data, width, height, atlasMode, lang }} />;
      case 'comparaisons-la-rochelle':
        return <ComparaisonsLaRochelle {...{ data, width, height, lang, atlasMode, callerProps }} />;
      case 'intro':
        return <Intro {...{ data, width, height, lang, atlasMode, callerProps }} />;
      case 'exports-vs-smogglage':
        return <ExportsVsSmogglage {...{ data, width, height, lang, atlasMode, callerProps }} />
      case 'smoggleur-statut':
        return <SmogglageStatus {...{ data, width, height, lang, atlasMode, callerProps }} />;
      case 'prix-smogglage-general':
        return <PrixSmogglageGeneral {...{ data, width, height, lang, atlasMode, callerProps }} />
      case 'carte-homeport-smoggleurs':
        return <HomeportSmoggleurs {...{ data, width, height, lang, atlasMode, callerProps }} />
      case 'departs-fr-vers-angleterre':
        return <DepartsFrVersAngleterre {...{ data, width, height, lang, atlasMode, callerProps }} />
      case 'destinations-gb-vers-gb':
        return <DestinationsGbVersGb {...{ data, width, height, lang, atlasMode, callerProps }} />
      case 'schema-sources':
        return <SchemaSources {...{ data, width, height, lang, atlasMode, callerProps }} />
      case 'resume-activite-dunkerquois':
        return <ResumeActivitesDunkerquois {...{ data, width, height, lang, atlasMode, callerProps }} />
      case 'imports-dunkerque-vs-ports-francs':
        return <ImportsDunkerqueVsPortsFrancs {...{ data, width, height, lang, atlasMode, callerProps }} />
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
    <div style={{ height }} onClick={e => e.stopPropagation()} className='VisualizationController viz-render' ref={ref}>
      {vizContent}
    </div>
  )
}