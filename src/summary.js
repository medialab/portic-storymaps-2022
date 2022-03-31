/* eslint import/no-webpack-loader-syntax : 0 */
import ScrollyPage from './components/ScrollyPage';

// import PartHome from './contents/home.mdx';
import Part0 from './content/fr/partie-0.mdx';
// import Part1 from './contents/partie-1.mdx';
// import Part2 from './contents/partie-2.mdx';
// import PartAbout from './contents/about.mdx';

const summary = [
  {
    routes: {
      fr: 'partie-0',
      en: 'part-0'
    },
    titles: {
      fr: 'Partie 0',
      en: 'Part 0'
    },
    shortTitles: {
      fr: 'x',
      en: 'x'
    },
    contents: {
      fr: Part0,
      en: Part0,
    },
    Component: ScrollyPage,
    routeGroup: 'primary'
  },
  // {
  //   routes: {
  //     fr: 'partie-2',
  //     en: 'part-2'
  //   },
  //   titles: {
  //     fr: 'Une forte spécialisation portuaire: le cas de la traite négrière, du commerce du sel et de l\'eau-de-vie',
  //     en: 'A strong portual specialization'
  //   },
  //   shortTitles: {
  //     fr: 'une forte spécialisation portuaire',
  //     en: 'a strong portual specialization'
  //   },
  //   contents: {
  //     fr: 'fr/partie-2.mdx',
  //     en: 'en/part-2.mdx'
  //   },
  //   contentsProcessed: {
  //     fr: Part2IntroFr,
  //     en: Part2IntroEn,
  //   },
  //   Component: ScrollyPage,
  //   routeGroup: 'primary'
  // },
  // {
  //   routes: {
  //     fr: 'partie-3',
  //     en: 'part-3'
  //   },
  //   titles: {
  //     fr: 'La Rochelle, port dominant mais pas structurant',
  //     en: 'La Rochelle port, dominating but not structuring'
  //   },
  //   shortTitles: {
  //     fr: 'un port dominant mais pas structurant',
  //     en: 'a dominating but not structuring port'
  //   },
  //   contents: {
  //     fr: 'fr/partie-3.mdx',
  //     en: 'en/part-3.mdx'
  //   },
  //   contentsProcessed: {
  //     fr: Part3Fr,
  //     en: Part3En,
  //   },
  //   Component: ScrollyPage,
  //   routeGroup: 'primary'
  // },
  // {
  //   routes: {
  //     fr: 'references',
  //     en: 'references'
  //   },
  //   titles: {
  //     fr: 'Références',
  //     en: 'References'
  //   },
  //   shortTitles: {
  //     fr: 'références',
  //     en: 'references'
  //   },
  //   contents: {
  //     fr: 'fr/references.mdx',
  //     en: 'en/references.mdx'
  //   },
  //   contentsProcessed: {
  //     fr: ReferencesFr,
  //     en: ReferencesEn,
  //   },
  //   routeGroup: 'secondary',
  // },
  // {
  //   routes: {
  //     fr: 'a-propos',
  //     en: 'about'
  //   },
  //   titles: {
  //     fr: 'À propos',
  //     en: 'About'
  //   },
  //   shortTitles: {
  //     fr: 'à propos',
  //     en: 'about'
  //   },
  //   contents: {
  //     fr: 'fr/a-propos.mdx',
  //     en: 'en/about.mdx'
  //   },
  //   contentsProcessed: {
  //     fr: AboutFr,
  //     en: AboutEn,
  //   },
  //   routeGroup: 'secondary',
  // },
  // {
  //   routes: {
  //     fr: 'tests',
  //     en: 'tests'
  //   },
  //   titles: {
  //     fr: 'Tests',
  //     en: 'Tests'
  //   },
  //   shortTitles: {
  //     fr: 'tests',
  //     en: 'tests'
  //   },
  //   contents: {
  //     fr: 'fr/tests.mdx',
  //     en: 'fr/tests.mdx'
  //   },
  //   contentsProcessed: {
  //     fr: TestsFr,
  //     en: TestsEn,
  //   },
  //   routeGroup: 'secondary',
  //   hide: process.env.NODE_ENV !== 'development'
  // }
]


export default summary;