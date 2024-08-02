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
    title: translate('EstimationImportsExports', 'title_left_general', lang),
    left: {
      title: translate('EstimationImportsExports', 'title_left_left', lang),
      items: [
        {
          field: 'imports du bf de Dunkerque',
          title: translate('EstimationImportsExports', 'imports_bf_dk', lang),
          isSource: true
        }
      ]
    },
    right: {
      title: translate('EstimationImportsExports', 'title_left_right', lang),
      items: [
        {
          field: 'toflit18 flux mirroir : dk > france',
          title: translate('EstimationImportsExports', 'known_exports_to_france', lang),
          // title: 'imports déclarés par la France avec le partenaire Dunkerque (toflit18)',
          isSource: true,
          isCounted: true,
        },
        {
          field: 'toflit18 exports produits coloniaux (monde...)',
          title: translate('EstimationImportsExports', 'known_colonial_exports', lang),
          isSource: true,
          displaceValue: 3734878,
        },
        {
          field: withLest ? 'estimation des exports par projection (hyp. lest)' : 'estimation des exports par projection (hyp. sans lest)',
          // title: 'estimation des exports totaux (hors smogglage) par projection tonnage/prix'
          title: translate('EstimationImportsExports', 'estimation_total_exports', lang)
        },
        {
          field: 'estimation smogglage',
          title: translate('EstimationImportsExports', 'estimation_smogglage', lang)
        },
      ]
    }
  }
  const englandZoomModel = {
    title: translate('EstimationImportsExports', 'title_right_general', lang),
    left: {
      title: translate('EstimationImportsExports', 'title_right_left', lang),
      items: [
        {
          title: translate('EstimationImportsExports', 'imports_cust', lang),
          field: 'CUST Flandres > GB',
          isSource: true,
        }
      ]
    },
    right: {
      title: translate('EstimationImportsExports', 'title_right_right', lang),
      items: [
        {
          field: 'toflit18 exports légitimes dk > angleterre',
          title: translate('EstimationImportsExports', 'known_uk_exports', lang),
          isSource: true,
        },
        {
          field: withLest ? 'projection angleterre uniquement (hyp lest)' : 'projection angleterre uniquement (hyp sans lest)',
          title: translate('EstimationImportsExports', 'estimated_uk_exports', lang)
        },
        {
          field: 'estimation smogglage',
          title: translate('EstimationImportsExports', 'estimated_smuggling', lang)
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
            lang,
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
            lang,
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