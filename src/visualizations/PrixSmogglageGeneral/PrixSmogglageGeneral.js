import { useMemo, useState } from "react";

import BarChart from "../../components/BarChart";

import './PrixSmogglageGeneral.scss';

import {
  productsQuantiFields,
} from './groupings';
import translate from "../../utils/translate";


const unitsSup = {
  // 'Boissons alcoolisées tout type': 'pintes de Paris',
  'eau de vie, taffia, genieve': 'pintes',
  'vins': 'pintes',
  // 'Tabac en feuilles': 'livres poids',
  'tabac en feuilles': 'livres poids',
  'café': 'livres poids',
  'thé': 'livres poids',
  'sucre': 'livres poids',
  'sucre brut': 'livres poids',
}


export default function PrixSmogglageGeneral({
  width,
  height,
  data,
  atlasMode,
  lang,
}) {


  const [selectedQuantiField, setSelectedQuantiField] = useState('valeur_smogglé1');

  const productsData = useMemo(() => {
    return data
      .map(input => {
        return Object.keys(input).reduce((res, key) => {
          return {
            ...res,
            [key]: Object.keys(productsQuantiFields).includes(key) ? +input[key].replace(',', '.') : input[key]
          }
        }, {})
      })
      .map(obj => ({
        ...obj,
        unité: obj.unité.length ? obj.unité === 'livre tournois' ? 'livres tournois' : obj.unité : unitsSup[obj.produit_smogglé] || 'unité inconnue'
      }))
      .sort((a, b) => {
        if (+a.valeur_smogglé1 > +b.valeur_smogglé1) {
          return -1;
        }
        return 1;
      })
  }, [data]);

  console.log(productsData.filter(p => p.unité === 'unité inconnue'))

  const quantiFieldOptions = productsQuantiFields[selectedQuantiField]

  return (
    <div className={`PrixSmogglageGeneral ${atlasMode ? 'is-atlas-mode' : ''}`}>

      <div>
        <BarChart
          {...{
            data: productsData,
            width: width * .8,
            height,
          }}

          // layout='stack'
          orientation='vertical'
          margins={{
            left: 200
          }}

          y={{
            field: 'produit_smogglé',
            // tickFormat: d => `${formatNumber(d)} lt.`,
            // tickSpan: 5000000,
            // domain: [0, 15000001],
            // title: 'estimation en livres tournois', // translate('TonnagesF12', 'with_lest_title', lang)
          }}
          x={{
            field: selectedQuantiField,
            title: selectedQuantiField, // translate('TonnagesF12', 'destination', lang),
            tickFormat: quantiFieldOptions.tickFormat,
            tickSpan: quantiFieldOptions.tickSpan,
            domain: quantiFieldOptions.domain,
          }}

          color={{
            field: 'unité',
            title: translate('PrixSmogglageGeneral', 'color_title', lang)
            // title:  // translate('PecheTypeValue', 'color', lang)
          }}

        // tooltip={
        //   (d) => `estimation d'exports pour ${d.partenaire} : ${formatNumber(parseInt(d[field]))} lt. (pour ${formatNumber(parseInt(d.tonnage))} tonneaux cumulés)`
        // }
        />
      </div>
      <div className="legend-container">
        <h4>
          {translate('PrixSmogglageGeneral', 'select_prompt', lang)}
        </h4>
        <ul>
          {
            Object.keys(productsQuantiFields)
              .map(field => {
                const handleClick = () => {
                  setSelectedQuantiField(field)
                }
                return (
                  <li key={field} onClick={handleClick}>
                    <input
                      type="radio"
                      checked={selectedQuantiField === field}
                      readOnly
                    />
                    <span>
                      {productsQuantiFields[field].labels[lang]}
                    </span>
                  </li>
                )
              })
          }
        </ul>
      </div>



    </div>
  )
}