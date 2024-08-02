import React, { useEffect, useMemo, useState } from 'react';

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
import CommentedVideo from '../components/CommentedVideo';
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
import EstimationExportsDkSnail from './EstimationExportsDkSnail/EstimationExportsDkSnail';
import translate from '../utils/translate';

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
  callerProps: inputCallerProps,
  atlasMode,
  ...props
}) {
  // trying to dirtyfix a nasty bug with caller props
  const [callerProps, setCallerProps] = useState(inputCallerProps)
  useEffect(() => {
    setCallerProps(inputCallerProps);
  }, [inputCallerProps])

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
      // console.info('data not found', {visualizationsMetas: visualizationsMetas[vizId], vizDataFiles})
      return <>Les données de cette visualisation n'ont pu être chargées.</>;
    }
    let commentedImageLegend;
    switch (vizId) {
      case 'carte-destinations':
        return <CarteDestinations {...{ data, dimensions, lang, atlasMode, callerProps, ...props }} />;
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
      case 'estimation-exports-dk-snail':
        return (
          <EstimationExportsDkSnail {...{ data, dimensions, atlasMode, lang }} />
        )
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
          <TonnageMoyenMois {...{ data, dimensions, lang, atlasMode, callerProps }} />
        );
      case 'carte-peche':
        return (
          <PecheMap {...{ data, dimensions, lang, atlasMode, callerProps }} />
        );
      case 'pilotage':
        return (
          <Pilotage {...{ data, dimensions, lang, atlasMode, callerProps }} />
        );
      case 'gravure-smoggleurs':
        commentedImageLegend = {
          fr: `**Dany Guillou-Beuzit, Jacques Cambry,** voyage dans le Finistère ou état de ce département en 1794 et 1795, **Rennes, PUR, 2011 (dessin de Dany Guillou-Beuzit d’après le texte de Cambry)**`
        }
        return (
          <CommentedImage
            lang={lang}
            src={[`${process.env.BASE_PATH}/assets/${vizId}.jpg`]}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
        );
      case 'annexe-an-1790':
        // nom du document initial Bouchette arcpa_0000-0000_1885_num_20_1_8807_t1_0170_0000_6.pdf
        commentedImageLegend = {
          fr: `**Réclamation contre la franchise de Dunkerque par M. Bouchette, en annexe de la séance du 31 octobre 1790**, François-Joseph Bouchette`
        }
        return (
          <CommentedImage
            lang={lang}
            src={[`${process.env.BASE_PATH}/assets/seance-an-1790.png`]}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
        );
      case 'formule-estimation':
        return (
          <CommentedImage
            lang={lang}
            src={[`${process.env.BASE_PATH}/assets/${vizId}.png`]}
            width={width}
            height={height}
            legend={''}
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
              title: translate('HomeportsFromDunkerque', 'title', lang),
              tooltip: d => translate('HomeportsFromDunkerque', 'tooltip', lang, {
                tonnage: formatNumber(parseInt(d.tonnage)),
                homeport: lang === 'fr' ? d.homeport_fr : d.homeport_en,
                state: lang === 'fr' ? d.homeport_state_fr : d.homeport_state_en
              }),
              fieldsHierarchy: ['state_category', 'homeport', 'homeport_state_fr'],
              // fieldsHierarchy: ['state_category', 'homeport', 'homeport_state_fr', ],
              color: {
                field: lang === 'fr' ? 'homeport_state_fr' : 'homeport_state_en',
              },
              leaf: {
                labelField: 'homeport_' + lang,
                countField: 'tonnage',
                labelFormat: d => `${d['homeport_' + lang]} (${formatNumber(parseInt(d.tonnage))} ${lang === 'fr' ? 'tx' : 'b'})`
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
        return <ComparaisonsLaRochelle {...{ data, width, height: atlasMode ? height * 1.5 : height, lang, atlasMode, callerProps }} />;
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
      case 'video-pleniere':
        commentedImageLegend = {
          fr: `Enregistrement de la séance de plénière finale du datasprint`,
          en: `Recording of the final plenary session of the datasprint`
        }
        return (
          <CommentedVideo
            {...{
              width,
              height,
              legend: commentedImageLegend[lang],
              src: "https://www.youtube.com/embed/DbGCRRJjE2k?si=ZMkw2C0kOB7xqFML"
            }}
          />
        );
      case 'modules-recherche':
        commentedImageLegend = {
          fr: `Document rédigé collectivement en amont du datasprint pour définir les lignes de recherche durant l'atelier`,
          en: `Document collectively written prior to the datasprint to define the research lines during the workshop`
        }
        return (
          <CommentedVideo
            {...{
              width,
              height,
              legend: commentedImageLegend[lang],
              src: "https://www.youtube-nocookie.com/embed/E2YkZU_9Mes?si=OU46Bi5O5h1rUvAT&amp;controls=0"
            }}
          />
        );
      case 'photos-datasprint':
        commentedImageLegend = {
          fr: `Photographies prises durant le datasprint PORTIC 2022`,
          en: `Photographs taken during the PORTIC 2022 datasprint`,
        }
        const datasprintPhotos = [];
        let i = 1;
        while (i <= 24) {
          datasprintPhotos.push(`${process.env.BASE_PATH}/assets/photo-datasprint-${i}.jpg`);
          i++;
        }
        return (
          <CommentedImage
            lang={lang}
            src={datasprintPhotos}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
        );
      case 'croquis-visualisations':
        commentedImageLegend = {
          fr: `Croquis préliminaires pour les visualisations de la publication`,
          en: `Preliminary sketches for the visualizations of the publication`
        }
        return (
          <CommentedImage
            lang={lang}
            src={[
              `${process.env.BASE_PATH}/assets/croquis-carte-destinations-dunkerquois.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-carte-homeport-smoggleurs.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-departs-fr-vers-angleterre.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-destinations-gb-vers-gb.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-evolution-peche.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-evolution-type-conges.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-exports-vs-smogglage.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-fausses-declarations.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-fraude-exports-dunkerque.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-fraude-exports-ports-francs.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-imports-dunkerque-vs-ports-francs.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-pilotage.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-resume-activite-dunkerquois-1787.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-smogglage-par-port-fr.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-smoggleur-statut.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-smoggleurs-produits-vs-departs.jpg`,
              `${process.env.BASE_PATH}/assets/croquis-stigmates-smoggleurs-dunkerque.jpg`,
            ]}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
        );
      case 'datasprint-programme':
        commentedImageLegend = {
          fr: `Programme de la semaine de datasprint`,
          en: `Schedule of the datasprint week`,
        }
        return (
          <CommentedImage
            lang={lang}
            src={[
              `${process.env.BASE_PATH}/assets/datasprint-programme.png`,
            ]}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
        );
      case 'datasprint-infrastructure':
        commentedImageLegend = {
          fr: `Infrastructure spatiale et numérique du datasprint`,
          en: `Digital and spatial infrastructure of the datasprint`
        }
        return (
          <CommentedImage
            lang={lang}
            src={[
              `${process.env.BASE_PATH}/assets/datasprint-infrastructure-1.png`,
              `${process.env.BASE_PATH}/assets/datasprint-infrastructure-2.jpg`,
              `${process.env.BASE_PATH}/assets/datasprint-infrastructure-2.5.png`,
              `${process.env.BASE_PATH}/assets/datasprint-infrastructure-3.jpg`,
              `${process.env.BASE_PATH}/assets/datasprint-infrastructure-4.jpg`,
              `${process.env.BASE_PATH}/assets/datasprint-infrastructure-5.png`,
              `${process.env.BASE_PATH}/assets/datasprint-infrastructure-6.png`,
              `${process.env.BASE_PATH}/assets/datasprint-infrastructure-7.png`,
            ]}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
        );
      case 'viz-preparatoires-christine':
        commentedImageLegend = {
          fr: `Cartes réalisées par Christine Plumejeaud en vue de préparer le travail sur les données navigocorpus concernant les échanges entre Dunkerque et la Grande-Bretagne`,
          en: `Maps created by Christine Plumejeaud to prepare the work on Navigocorpus data concerning exchanges between Dunkirk and Great Britain`
        }
        return (
          <CommentedImage
            lang={lang}
            src={[
              `${process.env.BASE_PATH}/assets/viz-preparatoires-christine-plumejeaud1.png`,
              `${process.env.BASE_PATH}/assets/viz-preparatoires-christine-plumejeaud2.png`,
              `${process.env.BASE_PATH}/assets/viz-preparatoires-christine-plumejeaud3.png`,
            ]}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
        );
      case 'about-modeles':
        commentedImageLegend = {
          fr: `Diagrammes représentant les modélisations informatiques inventés pour transformer en données les différentes sources historiques`,
          en: `Diagrams representing computer models invented to transform various historical sources into data`
        }
        return (
          <CommentedImage
            lang={lang}
            src={[
              `${process.env.BASE_PATH}/assets/modele-navigocorpus.png`,
              `${process.env.BASE_PATH}/assets/modele-toflit18.png`,
              `${process.env.BASE_PATH}/assets/modele-pointcall.png`,
            ]}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
        );
      case 'processus-maj-automatique':
        commentedImageLegend = {
          fr: `Schématisation de l'infrastructure de mise à jour simultanée des contenus permettant une écriture collective des textes, des données et des visualisations`,
          en: `Diagram of the simultaneous content update infrastructure enabling collective writing of texts, data, and visualizations`
        }
        return (
          <CommentedImage
            lang={lang}
            src={[
              `${process.env.BASE_PATH}/assets/processus-maj-automatique.png`,
            ]}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
        );
      case 'making-of-alignement-tonneaux':
        commentedImageLegend = {
          fr: `Schémas et visualisations exploratoires réalisées pour l'alignement des données dans le cadre des calculs finaux de la troisième partie`,
          en: `Diagrams and exploratory visualizations created for data alignment in the final calculations of the third part`
        };
        return (
          <CommentedImage
            lang={lang}
            src={[
              `${process.env.BASE_PATH}/assets/making-of-tonneaux.png`, 
              `${process.env.BASE_PATH}/assets/alignement-tonneaux-bonus.png`, 
              `${process.env.BASE_PATH}/assets/valeur-par-tonneau.jpg`
            ]}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
        );
      case 'datasprint-explorer':
        commentedImageLegend = {
          fr: `Application "navigo datasprint explorer", développée par Guillaume Brioude`,
          en: `Application "navigo datasprint explorer", developed by Guillaume Brioude`
        }
        return (
          <CommentedImage
            lang={lang}
            src={[
              `${process.env.BASE_PATH}/assets/datasprint-explorer-3.png`,
              `${process.env.BASE_PATH}/assets/datasprint-explorer-2.png`,
              `${process.env.BASE_PATH}/assets/datasprint-explorer-1.png`,
            ]}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
        );
      case 'frise-maxime':
        commentedImageLegend = {
          fr: `Travail de design graphique réalisé par Maxime Zoffoli pour la réalisation de la frise interactive visible en partie 1 du site, et le graphique d'explication sur l'estimation des nombres de départ de Dunkerque à partir des données du pilotage, visible en partie 1 également.`,
          en: `Graphic design work by Maxime Zoffoli for the creation of the interactive timeline visible in part 1 of the site, and the explanatory chart on estimating the number of departures from Dunkirk based on piloting data, also visible in part 1.`
        }
        return (
          <CommentedImage
            lang={lang}
            src={[
              `${process.env.BASE_PATH}/assets/maxime-1.png`,
              `${process.env.BASE_PATH}/assets/maxime-2.png`,
              `${process.env.BASE_PATH}/assets/maxime-3.png`,
              `${process.env.BASE_PATH}/assets/maxime-4.png`,
              `${process.env.BASE_PATH}/assets/maxime-5.png`,
            ]}
            width={width}
            height={height}
            legend={commentedImageLegend[lang]}
          />
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
    <div style={{ height }} onClick={e => e.stopPropagation()} className='VisualizationController viz-render' ref={ref}>
      {vizContent}
    </div>
  )
}