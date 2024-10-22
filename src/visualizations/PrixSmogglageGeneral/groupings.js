import { formatNumber } from "../../utils/misc";

export const productsQuantiFields = {
  "valeur_smogglé1": {
    tickFormat: (d, lang) => `${formatNumber(d, lang)} lt`,
    // tickSpan: 250000,
    // domain: [0, 1250001],
    tickSpan: 500000,
    domain: [0, 1000001],
    labels: {
      fr: "Estimation de la valeur à partir des quantités",
      en: "Value estimate made according to quantities"
    }
  },
  // "estimation_prix2_moyenne": {
  //   tickFormat: d => `${formatNumber(d, lang)} lt`,
  // },
  // "valeur_smogglé2": {
  //   tickFormat: d => `${formatNumber(d, lang)} lt`,
  //   tickSpan: 250000,
  //   domain: [0, 1250001],
  //   labels: {
  //     fr: "Valeur smogglée (estimation 2)",
  //     en: "Valeur smogglée (estimation 2)"
  //   }
  // },
  // "quantité_smogglée",
  "nombre_observations_avec_unité_exacte_toutes_custom_regions": {
    tickFormat: (d, lang) => `${d} obs.`,
    tickSpan: 10,
    labels: {
      fr: "Nombre d'observations avec unité exacte toutes directions de fermes",
      en: "Number of observations with exact units for all directions de fermes",
    }
  },
  "nombre_observations_versAngleterre": {
    tickFormat: (d, lang) => `${d} obs.`,
    tickSpan: 1,
    labels: {
      fr: "Nombre d'observations vers l'Angleterre",
      en: "Number of observations towards England"
    }
  },
  // "estimation_prix1_moyenne": {
  //   tickFormat: d => `${formatNumber(d, lang)} lt`,
  //   labels: {
  //     fr: "Estim",
  //     en: "Nombre d'observations vers l'Angleterre"
  //   }
  // },
  
};
