import { useMemo, useState } from "react";
import BarChart from "../../components/BarChart";

const productsQuantiFields = [
  "quantité_smogglée",
  "nombre_observations_avec_unité_exacte_toutes_custom_regions",
  "nombre_observations_versAngleterre",
  "estimation_prix1_moyenne",
  "valeur_smogglé1",
  "estimation_prix2_moyenne",
  "valeur_smogglé2",
];

const portsQuantiFields = [
  "geniève (pintes de Paris)",
"eau-de-vie (pintes de Paris)",
"Taffia (pintes de Paris)",
"tabac en feuilles (livres poids)",
"thé (livres poids)",
"corinthes (livres poids)",
"vin rouge (pintes)",
"vin fin (pintes)",
"vin (barriques)",
"vin (pots)",
"liqueurs (pintes)",
"tabac en poudre (livre poids)",
"tabac fabriqué (livres poids)",
"tabac en côtes (livres poids)",
"drogues (livres poids)",
"rhubarbre (livres poids)",
"amidon (livres poids)",
"café (livres poids)",
"sucre brut (livres poids)",
"sucre rafiné (livres)",
"sucre en pain (livres poids)",
"mousseline (livres poids)",
"mousseline (livres tounois)",
"mousseline des Indes (livres tournois)",
"mousselines et mouchoirs (livres tournois)",
"mouchoirs de mousseline (livres poids)",
"mouchoirs de mousselin (valeur en £-stg)",
"mouchoirs de soie (livres poids)",
"mouchoirs de soie (livres tournois)",
"perses (livres poids)",
"nankins (livres poids)",
"nankins (pièces)",
"mouchoirs de Bandannoes (livres poids)",
"Bandanoes (livres poids)",
"bandanoes (valeur livres tournois)",
"Bandanoes (pièces)",
"Dimity (?) (livres poids)",
"crêpes (livres poids)",
"Soie des Indes (livres poids)",
"soie et mousseline (livres tournois)",
"marchandises des Indes (livres tournois)",
"soieries (livres tournois)",
"Jalap (livres poids)",
"Taffetas (livres poids)",
"Cambray (en livres tournois)",
"Cambray (en £ stg)",
"cambray (livres poids)",
"Gauzes (livres poids)",
"mercerie fine (livres poids)",
"sené (livres poids)",
"nacres de perle (livres tournois)",
"pots de vess (en bouteiilles) /  potjevleesch???",
"porcelaine (livres tournois)",
"voiture",
"Chocolat (livres poids)",
"cartes à jouer (en livres poids)",
"poudre à poudrer (livres poids)"
]

export default function ExportsVsSmogglage({
  width,
  height,
  data
}) {
  const {
    productsData,
    homeportsData,
    portsList
  } = useMemo(() => {
    return {
      productsData: data.get('smogglage-estimation-par-produit.csv')
        .map(input => {
          return Object.keys(input).reduce((res, key) => {
            return {
              ...res,
              [key]: productsQuantiFields.includes(key) ? +input[key].replace(',', '.') : input[key]
            }
          }, {})
        }),
      homeportsData: data.get('smogglage-vs-exports-par-homeport.csv'),
      portsList: data.get('smogglage-vs-exports-par-homeport.csv').map(p => p.port)
    }
  }, [data]);

  const [selectedQuantiField, setSelectedQuantiField] = useState('nombre_observations_versAngleterre');
  const [selectedPortsOverviewQuantiField, setPortsOverviewQuantiField] = useState('nb_pointcalls');
  const [selectedPort, setSelectedPort] = useState('Deal');

  const detailsData = useMemo(() => {
    if (homeportsData) {
      const port = homeportsData.find(p => p.port === selectedPort);
      if (port) {
        return portsQuantiFields.map((field) => {
          const unit = field.split('(').length > 1 ? field.split('(').pop().replace(')', '') : 'indéfini';
          return {
            field: field.split('(')[0],
            quantity: +port[field],
            group: unit
          }
        })
      }
    }
    return '';
  }, [selectedPort, data])


  const portsOverviewFieldsChoices = [
    'tonnage',
    'nb_pointcalls',
    'shipment_price'
  ]

  return (
    <div className='ExportsVsSmogglage'>
      <img
        src={`${process.env.BASE_PATH}/assets/exports-vs-smogglage.jpg`}
        {...{ width, height }}
        style={{ objectFit: 'contain' }}
      />
      <div>
        <h3>Attention les visualisations suivantes sont des visualisations de travail ! à ce stade l'important est la vérification des données, par le modèle visuel</h3>
      </div>
      <h4>1. Prix des produits smogglés</h4>
      <div>
        Choisir la quantité à afficher dans l'histogramme de travail suivant (tiré du <a href="https://docs.google.com/spreadsheets/d/1NdzRMa2JvuDndKk_sJNukT0yACxqj2BJoOvQcHCauDo/edit#gid=736079474" target="blank">tableau de Pierre Niccolo</a> ) :
        <ul>
          {
            productsQuantiFields
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
                      {field}
                    </span>
                  </li>
                )
              })
          }
        </ul>
      </div>
      <BarChart
        {...{
          data: productsData,
          width: width,
          height,
        }}

        // layout='stack'
        orientation='vertical'

        y={{
          field: 'produit_smogglé',
          // tickFormat: d => `${formatNumber(d)} lt.`,
          // tickSpan: 5000000,
          // domain: [0, 15000001],
          // title: 'estimation en livres tournois', // translate('TonnagesF12', 'with_lest_title', lang)
        }}
        x={{
          field: selectedQuantiField,
          title: selectedQuantiField, // translate('TonnagesF12', 'destination', lang)
        }}

        color={{
          field: 'unité',
          // title:  // translate('PecheTypeValue', 'color', lang)
        }}

      // tooltip={
      //   (d) => `estimation d'exports pour ${d.partenaire} : ${formatNumber(parseInt(d[field]))} lt. (pour ${formatNumber(parseInt(d.tonnage))} tonneaux cumulés)`
      // }
      />
      <h4>2. Estimation des valeurs et produits smogglés par homeport</h4>
      <div>Quantifier la visualisation suivante (faite à partir de <a href="https://github.com/medialab/portic-datasprint-2022/blob/main/productions/module_05/data/dunkerque_smugglers_shipmentvalues.csv" target="blank">ces données</a>) par :</div>
      <ul>
        {
          portsOverviewFieldsChoices
            .map(field => {
              const handleClick = () => {
                setPortsOverviewQuantiField(field)
              }
              return (
                <li key={field} onClick={handleClick}>
                  <input
                    type="radio"
                    checked={selectedPortsOverviewQuantiField === field}
                    readOnly
                  />
                  <span>
                    {field}
                  </span>
                </li>
              )
            })
        }
      </ul>
      <BarChart
        {...{
          data: homeportsData
          .sort((a, b) => {
            if (+a[selectedPortsOverviewQuantiField] > +b[selectedPortsOverviewQuantiField]) {
              return -1;
            }
            return 1;
          }),
          width: width,
          height: height * 2,
        }}

        // layout='stack'
        orientation='vertical'

        y={{
          field: 'port',
          // tickFormat: d => `${formatNumber(d)} lt.`,
          // tickSpan: 5000000,
          // domain: [0, 15000001],
          // title: 'estimation en livres tournois', // translate('TonnagesF12', 'with_lest_title', lang)
        }}
        x={{
          field: selectedPortsOverviewQuantiField,
          title: selectedPortsOverviewQuantiField, // translate('TonnagesF12', 'destination', lang)
        }}

        color={{
          field: 'comte',
          // title:  // translate('PecheTypeValue', 'color', lang)
        }}

      // tooltip={
      //   (d) => `estimation d'exports pour ${d.partenaire} : ${formatNumber(parseInt(d[field]))} lt. (pour ${formatNumber(parseInt(d.tonnage))} tonneaux cumulés)`
      // }
      />

      <div>
        <p>Sélectionner un port à inspecter en détail :</p>
        <select>
          {
            portsList
            .map(port => {
              const handleClick = () => {
                setSelectedPort(port);
              }
              return (
                <option onClick={handleClick} value={port}>
                  {port}
                </option>
              )
            })
          }
        </select>
      </div>
      <BarChart
        {...{
          data: detailsData
          .sort((a, b) => {
            if (a.quantity > b.quantity) {
              return -1;
            }
            return 1;
          })
          ,
          width: width,
          height: height * 2,
        }}
        orientation='vertical'

        y={{
          field: 'field',
        }}
        x={{
          field: 'quantity',
          title: 'quantity', // translate('TonnagesF12', 'destination', lang)
        }}

        color={{
          field: 'group',
        }}

      />
    </div>
  )
}