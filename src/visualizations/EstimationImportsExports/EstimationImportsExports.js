import BarChart from "../../components/BarChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';
import ColumnsComparison from "./ColumnsComparison";

const EstimationImportsExports = ({
  data,
  width,
  height,
  lang,
}) => {
  const globalModel = {
    title: 'Résumé des quantités observées et projetées',
    left: {
      title: 'Imports connus',
      items: [
        {
          field: 'imports du bf de Dunkerque',
          title: 'imports du bureau des fermes de Dunkerque'
        }
      ]
    },
    right: {
      title: 'Compte des exports',
      items: [
        {
          field: 'estimation smogglage'
        },
        {
          field: 'estimation des exports par projection (hyp. lest)',
          title: 'estimation des exports par projection tonnage/prix'
        },
        {
          field: 'toflit18 flux mirroir : dk > france',
          title: 'dk > france (toflit18)'
        },
        {
          field: 'toflit18 exports produits coloniaux (monde...)',
          title: 'exports coloniaux (toflit18)'
        }
      ]
    }
  }
  const englandZoomModel = {
    title: 'Zoom sur le Royaume Uni',
    left: {
      title: 'Vu par le Royaume Uni',
      items: [
        {
          title: 'imports depuis Flandres françaises selon les royal customs',
          field: 'CUST Flandres > GB'
        }
      ]
    },
    right: {
      title: 'Vu par la France',
      items: [
        {
          field: 'toflit18 exports légitimes dk > angleterre',
          title: 'exports > GB déclarés toflit18'
        },
        {
          field: 'projection angleterre uniquement (hyp sans lest)',
          title: 'projection GB'
        },
        {
          field: 'estimation smogglage'
        },
        
      ]
    }
  }
  return (
    <>
      <BarChart
        {...{
          data,
          width: width,
          height: height,
        }}

        layout='stack'
        orientation='vertical'
        margins={{
          left: 200
        }}
        x={{
          field: 'valeur',
          tickFormat: d => `${formatNumber(d)} lt.`,
          // tickSpan: 5000000,
          // domain: [0, 15000001],
          title: 'valeur', // translate('TonnagesF12', 'with_lest_title', lang)
        }}
        y={{
          field: 'label',
          title: 'métrique', // translate('TonnagesF12', 'destination', lang)
        }}
        color={{
          field: 'type',
          // title:  // translate('PecheTypeValue', 'color', lang)
        }}

        tooltip={
          (d) => `métrique pour ${d.label} : ${formatNumber(parseInt(d.valeur))} lt.`
        }
      />
      <ColumnsComparison
        {
          ...{
            width: width / 2,
            height: height,
            data,
            ...globalModel,
            title: 'Estimation globale',
          }
        }
      />
      <ColumnsComparison
        {
          ...{
            width: width / 2,
            height: height,
            data,
            ...englandZoomModel,
            title: 'Zoom sur le royaume uni',
          }
        }
      />
    </>
  )
}

export default EstimationImportsExports;