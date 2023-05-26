import { useState } from "react";
// import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';
import ColumnsComparison from "./ColumnsComparison";

import './EstimationImportsExports.scss';

const EstimationImportsExports = ({
  data,
  width,
  height,
  lang,
}) => {

  const [withLest, setWithLest] = useState(true);
  const globalModel = {
    title: 'Estimation des exports de Dunkerque',
    left: {
      title: 'Imports connus',
      items: [
        {
          field: 'imports du bf de Dunkerque',
          title: 'imports du bureau des fermes de Dunkerque',
          isSource: true
        }
      ]
    },
    right: {
      title: 'Exports connus et estimés',
      items: [
        {
          field: withLest ? 'estimation des exports par projection (hyp. lest)' : 'estimation des exports par projection (hyp. sans lest)',
          title: 'estimation des exports totaux (hors smogglage) par projection tonnage/prix'
        },
        {
          field: 'estimation smogglage'
        },
        
        {
          field: 'toflit18 flux mirroir : dk > france',
          title: 'exports connus de Dunkerque vers la France',
          // title: 'imports déclarés par la France avec le partenaire Dunkerque (toflit18)',
          isSource: true
        },
        {
          field: 'toflit18 exports produits coloniaux (monde...)',
          title: 'exports connus de produits coloniaux depuis Dunkerque',
          isSource: true,
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
          title: 'imports au RU depuis Flandres françaises selon les royal customs',
          field: 'CUST Flandres > GB',
          isSource: true,
        }
      ]
    },
    right: {
      title: 'Vu par la France',
      items: [
        {
          field: 'toflit18 exports légitimes dk > angleterre',
          title: 'exports connus vers le RU déclarés',
          isSource: true,
        },
        {
          field: withLest ? 'projection angleterre uniquement (hyp lest)' : 'projection angleterre uniquement (hyp sans lest)',
          title: 'estimation des exports vers le RU uniquement'
        },
        {
          field: 'estimation smogglage'
        },
        
      ]
    }
  }
  return (
    <div className="EstimationImportsExports">
      {/* <BarChart
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
      /> */}
      <ColumnsComparison
        {
          ...{
            width: width / 2,
            height: height,
            data,
            ...globalModel,
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
          }
        }
      />
      <div className="buttons-container" style={{ margin: '1rem' }}>
        <button className={`Button ${withLest ? 'is-active' : ''}`} onClick={() => setWithLest(true)}>
          {translate('TonnagesF12', 'hyp_with_lest', lang)}
        </button>
        <button className={`Button ${!withLest ? 'is-active' : ''}`} onClick={() => setWithLest(false)}>
          {translate('TonnagesF12', 'hyp_without_lest', lang)}
        </button>
      </div>
    </div>
  )
}

export default EstimationImportsExports;