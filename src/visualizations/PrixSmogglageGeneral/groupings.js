import { formatNumber } from "../../utils/misc";

export const productsQuantiFields = {
  "valeur_smogglé1": {
    tickFormat: d => `${formatNumber(d)} lt`,
    tickSpan: 250000,
    domain: [0, 1250001],
    labels: {
      fr: "Valeur smogglée",
      en: "Valeur smogglée"
    }
  },
  // "estimation_prix2_moyenne": {
  //   tickFormat: d => `${formatNumber(d)} lt`,
  // },
  // "valeur_smogglé2": {
  //   tickFormat: d => `${formatNumber(d)} lt`,
  //   tickSpan: 250000,
  //   domain: [0, 1250001],
  //   labels: {
  //     fr: "Valeur smogglée (estimation 2)",
  //     en: "Valeur smogglée (estimation 2)"
  //   }
  // },
  // "quantité_smogglée",
  "nombre_observations_avec_unité_exacte_toutes_custom_regions": {
    tickFormat: d => `${formatNumber(d)} obs.`,
    tickSpan: 10,
    labels: {
      fr: "Nombre d'observations avec unité exacte toutes directions de fermes",
      en: "Nombre d'observations avec unité exacte toutes directions de fermes",
    }
  },
  "nombre_observations_versAngleterre": {
    tickFormat: d => `${formatNumber(d)} obs.`,
    tickSpan: 1,
    labels: {
      fr: "Nombre d'observations vers l'Angleterre",
      en: "Nombre d'observations vers l'Angleterre"
    }
  },
  // "estimation_prix1_moyenne": {
  //   tickFormat: d => `${formatNumber(d)} lt`,
  //   labels: {
  //     fr: "Estim",
  //     en: "Nombre d'observations vers l'Angleterre"
  //   }
  // },
  
};
