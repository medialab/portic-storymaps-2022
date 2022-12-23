import { lt } from "lodash";
import { useState, useMemo } from "react";
import BarChart from "../../components/BarChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';
import './ComparaisonsLaRochelle.scss';

const ComparaisonsLaRochelle = ({
  data,
  width,
  height,
  lang,
}) => {
  // const [withLest, setWithLest] = useState(true);
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
  return (
    <div className="ComparaisonsLaRochelle">
      <div className="columns-container">
        <div className="column">
          <h2>Exports toflit18 de la Direction des Fermes (DF) de La Rochelle en 1789</h2>
          <BarChart
            {...{
              data: [
                ...data.get('comparaisons-la-rochelle-toflit18.csv'),
                {partenaire: 'Outre-mers', valeur: 0}
              ]
              .sort((a, b) => {
                if (a.partenaire.toLowerCase().replace('é', 'e') > b.partenaire.toLowerCase().replace('é', 'e')) {
                  return 1;
                }
                return -1;
              }),
              width: width / 2,
              height: height / 2,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: 'valeur',
              tickFormat: d => `${formatNumber(d)} lt.`,
              tickSpan: 2000000,
              title: 'valeur', // translate('TonnagesF12', 'with_lest_title', lang)
              domain: [0, 6000001]
            }}
            y={{
              field: 'partenaire',
              title: 'partenaire', // translate('TonnagesF12', 'destination', lang)
            }}
            // color={{
            // field: 'tonnage',
            // title:  // translate('PecheTypeValue', 'color', lang)
            // }}

            tooltip={
              (d) => `${formatNumber(parseInt(d.valeur))} lt pour ${d.partenaire}`
            }
          />
        </div>
        <div className="column">
          <h2>Destinations navigo au départ des ports de la DF de La Rochelle en 1789</h2>
          <BarChart
            {...{
              data: [
                ...data.get('comparaisons-la-rochelle-navigo.csv'),
                {destination: 'Monde', tonnage: 0}
              ]
              .sort((a, b) => {
                if (a.destination.toLowerCase().replace('é', 'e') > b.destination.toLowerCase().replace('é', 'e')) {
                  return 1;
                }
                return -1;
              }),
              width: width / 2,
              height: height / 2,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              'field': 'tonnage',
              // field: withLest ? 'price_per_barrel' : 'price_per_barrel_without_lest',
              tickFormat: d => `${formatNumber(d)} tx`,
              tickSpan : 5000,
              title: 'tonnage', // translate('TonnagesF12', 'with_lest_title', lang)
              domain: [0, 15001]
            }}
            y={{
              field: 'destination',
              title: 'destination', // translate('TonnagesF12', 'destination', lang)
            }}
            // color={{
            // field: 'tonnage',
            // title:  // translate('PecheTypeValue', 'color', lang)
            // }}

            tooltip={
              (d) => `${formatNumber(parseInt(d.tonnage))} lt/tonneau pour ${d.destination}`
            }
          />
        </div>        
      </div>
      <div className="columns-container">
        <div className="column">
          <h2>Vérification de la projection : dans la source = {formatNumber(parseInt(totaux.find(d => d.group === "vraie valeur dans toflit18 (pondéré avec terre-mer)").value))} lt., projeté = {formatNumber(parseInt(totaux.find(d => d.group === "estimation par tonnage x prix par tonneau F12/1787").value))} lt.</h2>
        <BarChart
              {...{
                data: [
                  ...data.get('comparaisons-la-rochelle-projection.csv'),
                  // { partenaire: 'Outre-mers', valeur: 0 }
                ]
                .filter( d => d['value'] > 0 && d.partner !== "total")
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
                tickFormat: d => `${formatNumber(d)} lt.`,
                tickSpan: 2000000,
                title: 'valeur', // translate('TonnagesF12', 'with_lest_title', lang)
                domain: [0, 10000001]
              }}
              y={{
                field: 'partner',
                title: 'partenaire', // translate('TonnagesF12', 'destination', lang)
              }}
              color={{
              field: 'group',
              title: 'type de métrique', // translate('PecheTypeValue', 'color', lang)
                palette: {
                  'vraie valeur dans toflit18 (pondéré avec terre-mer)': 'darkblue',
                  // 'vraie valeur dans toflit18 (non pondéré)': 'lightblue',
                  'estimation par tonnage x prix par tonneau F12/1787': 'darkgreen',
                  'estimation par tonnage x prix par tonneau F12/1787 (sans lest)': 'lightgreen',
                }
              }}

              tooltip={
                (d) => `${formatNumber(parseInt(d.value))} lt pour ${d.partner} (${d.group})`
              }
            />
        </div>
      </div>
    </div>
  )
}

export default ComparaisonsLaRochelle;