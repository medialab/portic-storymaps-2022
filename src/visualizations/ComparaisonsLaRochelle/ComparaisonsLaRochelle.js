import { lt } from "lodash";
import { useState, useMemo } from "react";
import BarChart from "../../components/BarChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';
import './ComparaisonsLaRochelle.scss';

const ComparaisonsLaRochelle = ({
  data,
  width,
  height: inputHeight,
  lang,
}) => {
  const height = inputHeight - 250;
  const [withLest, setWithLest] = useState(true);
  // const field = useMemo(() => withLest ? 'estimate' : 'estimate_without_lest', [withLest]);
  // const actualData = useMemo(() => {
  //   return data.sort((a, b) => {
  //     if (a['partenaire'].toLowerCase().replace('é', 'e') > b['partenaire'].toLowerCase().replace('é', 'e')) {
  //       return 1;
  //     }
  //     return -1;
  //   })
  //     .map(a => ({ ...a, [field]: +a[field] }))
  // }
  //   , [data, field])
  // const total = useMemo(() => {
  //   return actualData.reduce((sum, item) => {
  //     const val = item[field];
  //     return sum + val;
  //   }, 0)
  // }, [actualData, field])
  const totaux = data.get('comparaisons-la-rochelle-projection.csv').filter(d => d.partner === "total")

  const estimationSettings = {
    'vraie valeur dans toflit18 (pondéré avec terre-mer)': {
      color: '#ff493b',
      label: translate('ComparaisonLaRochelle', 'estimation_type_1', lang)
    },
    // 'vraie valeur dans toflit18 (non pondéré)': 'lightblue',
    'estimation par tonnage x prix par tonneau F12/1787': {
      color: '#133db2',
      label: translate('ComparaisonLaRochelle', 'estimation_type_2', lang)
    },
    'estimation par tonnage x prix par tonneau F12/1787 (sans lest)': {
      color: '#2926B0',
      label: translate('ComparaisonLaRochelle', 'estimation_type_3', lang)
    },
  }
  const estimationColorLegend = Object.entries(estimationSettings)
    .filter(([group]) => {
      if (group.includes('valeur') && !group.includes('non pondéré')) {
        return true;
      } else if (!withLest && group.includes('(sans lest)')) {
        return true;
      } else if (withLest && !group.includes('(sans lest)')) {
        return true
      }
    })
    .reduce((res, [key, { color, label }]) => ({ ...res, [label]: color }), {})
  const fixLabels = (items, fields) => 
    fields.reduce((cur, field) => {
      return cur.map(item => {
        let label = item[field] + '';
        if (label === 'Flandre et autres états de l\'Empereur') {
          label = 'Flandre et autres ...';
        } else if (label === 'Monde') {
          label = 'Partenaires indéfinis';
        } else if (label === 'Flanders and other estates of the Emperor') {
          label = 'Flanders et other ...';
        } else if (label === 'World') {
          label = 'Undefined partners';
        } else if (label === 'undefined') {
          label = 'Undefined partners';
        }
        return {
          ...item,
          [field]: label
        }
      })
    }, items)

  const exportsMonde = +data.get('comparaisons-la-rochelle-toflit18.csv').find(d => d.partenaire === 'Monde').valeur;
  return (
    <div className="ComparaisonsLaRochelle">
      <div className="columns-container">
        <div className="column">
          <h2>{translate('ComparaisonLaRochelle', 'title1', lang)}</h2>
          <BarChart
            {...{
              data: [
                ...fixLabels(data.get('comparaisons-la-rochelle-toflit18.csv'), ['partenaire', 'partenaire_en']),
                { partenaire: 'Outre-mers', partenaire_en: 'Overseas', valeur: 0, group: 'defined' }
              ]
                .sort((a, b) => {
                  if (a.partenaire.toLowerCase().replace('é', 'e') > b.partenaire.toLowerCase().replace('é', 'e')) {
                    return 1;
                  }
                  return -1;
                }),
              width: width / 2,
              height: height / 3 * 2,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: 'valeur',
              tickFormat: d => `${formatNumber(d, lang)} lt.`,
              tickSpan: 2000000,
              title: 'valeur', // translate('TonnagesF12', 'with_lest_title', lang)
              domain: [0, 6000001]
            }}
            y={{
              field: lang === 'fr' ? 'partenaire' : 'partenaire_en',
              title: 'partenaire', // translate('TonnagesF12', 'destination', lang)
            }}
            // color={{
            // field: 'tonnage',
            // title:  // translate('PecheTypeValue', 'color', lang)
            // }}

            tooltip={
              (d) => 
                translate('ComparaisonLaRochelle', 'tooltip1', lang, {
                  value: formatNumber(parseInt(d.valeur, lang)),
                  partner: lang === 'fr' ? d.partenaire : d.partenaire_en
                })
            }
          />
        </div>
        <div className="column">
          <h2>{translate('ComparaisonLaRochelle', 'title2', lang)}</h2>
          <BarChart
            {...{
              data: [
                ...fixLabels(data.get('comparaisons-la-rochelle-navigo.csv'), ['destination', 'destination_en']),
                { destination: 'Partenaires indéfinis', destination_en: 'Undefined partners', tonnage: 0, group: 'undefined' }
              ]
                .sort((a, b) => {
                  if (a.destination.toLowerCase().replace('é', 'e') > b.destination.toLowerCase().replace('é', 'e')) {
                    return 1;
                  }
                  return -1;
                }),
              width: width / 2,
              height: height / 3 * 2,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              'field': 'tonnage',
              // field: withLest ? 'price_per_barrel' : 'price_per_barrel_without_lest',
              tickFormat: d => `${formatNumber(d, lang)} ${lang === 'fr' ? 'tx' : 'tx'}`,
              tickSpan: 5000,
              title: 'tonnage', // translate('TonnagesF12', 'with_lest_title', lang)
              domain: [0, 15001]
            }}
            y={{
              field: lang === 'fr' ? 'destination' : 'destination_en',
              title: 'destination', // translate('TonnagesF12', 'destination', lang)
            }}
            // color={{
            // field: 'tonnage',
            // title:  // translate('PecheTypeValue', 'color', lang)
            // }}

            tooltip={
              (d) =>
                translate('ComparaisonLaRochelle', 'tooltip2', lang, {
                  value: formatNumber(parseInt(d.tonnage, lang)),
                  partner: lang === 'fr' ? d.destination : d.destination_en
                })
            }
          />
        </div>
      </div>
      <div className="columns-container">
        <div className="column">
          <h2>
          {translate('ComparaisonLaRochelle', 'title3', lang, {
            source_value: formatNumber(parseInt(totaux.find(d => d.group === "vraie valeur dans toflit18 (pondéré avec terre-mer)").value), lang),
            projected_value: formatNumber(parseInt(totaux.find(d => withLest ? d.group === "estimation par tonnage x prix par tonneau F12/1787" : d.group === "estimation par tonnage x prix par tonneau F12/1787 (sans lest)").value), lang)
          })}
          </h2>
          <BarChart
            {...{
              data: [
                ...fixLabels(data.get('comparaisons-la-rochelle-projection.csv'), ['partner', 'partner_en'])
                  .filter(({ group }) => {
                    if (group.includes('(non pondéré)')) {
                      return false;
                    }
                    else if (group.includes('valeur')) {
                      return true;
                    } else if (!withLest && group.includes('(sans lest)')) {
                      return true;
                    } else if (withLest && !group.includes('(sans lest)')) {
                      return true
                    }
                  })
                  .map(d => {
                    return {
                      ...d,
                      group: estimationSettings[d.group].label
                    }
                  }),
                  {
                    partner: 'Partenaires indéfinis',
                    partner_en: 'Undefined partners',
                    value: exportsMonde,
                    group: translate('ComparaisonLaRochelle', 'estimation_type_1', lang)
                  }
                // { partenaire: 'Outre-mers', valeur: 0 }
              ]
                .filter(d => d['value'] > 0 && d.partner !== "total")
                .sort((a, b) => {
                  if (a.partner.toLowerCase().replace('é', 'e') > b.partner.toLowerCase().replace('é', 'e')) {
                    return 1;
                  }
                  return -1;
                }),
              width: width,
              height: height / 2,
            }}

            layout='groups'
            orientation='vertical'
            x={{
              field: 'value',
              tickFormat: d => `${formatNumber(d, lang)} lt.`,
              tickSpan: 2000000,
              title: 'valeur', // translate('TonnagesF12', 'with_lest_title', lang)
              domain: [0, 10000001]
            }}
            y={{
              field: lang === 'fr' ? 'partner' : 'partner_en',
              title: 'partenaire', // translate('TonnagesF12', 'destination', lang)
            }}
            color={{
              field: 'group',
              title: translate('ComparaisonLaRochelle', 'color3', lang), // translate('PecheTypeValue', 'color', lang)
              palette: estimationColorLegend
            }}

            tooltip={
              (d) => 
                translate('ComparaisonLaRochelle', 'tooltip3', lang, {
                  value: formatNumber(parseInt(d.value, lang)),
                  partner: lang === 'fr' ? d.partner : d.partner_en,
                  unit: d.group
                })
            }
          />
        </div>
      </div>
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

export default ComparaisonsLaRochelle;