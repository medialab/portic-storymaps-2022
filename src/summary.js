/* eslint import/no-webpack-loader-syntax : 0 */
import ScrollyPage from './components/ScrollyPage';

// import PartHome from './contents/home.mdx';
import Part0 from './content/fr/partie-0.mdx';
import Part1 from './content/fr/partie-1.mdx';
import Part2 from './content/fr/partie-2.mdx';
import Part3 from './content/fr/partie-3.mdx';
// import PartAbout from './content/fr/about.mdx';

const summary = [
  {
    routes: {
      fr: 'partie-0',
      en: 'part-0'
    },
    titles: {
      fr: 'Intro',
      en: 'Intro-en'
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
  {
    routes: {
      fr: 'partie-1',
      en: 'part-1'
    },
    titles: {
      fr: 'Partie 1',
      en: 'Part 1'
    },
    shortTitles: {
      fr: 'x',
      en: 'x'
    },
    contents: {
      fr: Part1,
      en: Part1
    },
    Component: ScrollyPage,
    routeGroup: 'primary'
  },
  {
    routes: {
      fr: 'partie-2',
      en: 'part-2'
    },
    titles: {
      fr: 'Partie 2',
      en: 'Part 2'
    },
    shortTitles: {
      fr: 'x',
      en: 'x'
    },
    contents: {
      fr: Part2,
      en: Part2
    },
    Component: ScrollyPage,
    routeGroup: 'primary'
  },
  {
    routes: {
      fr: 'partie-3',
      en: 'part-3'
    },
    titles: {
      fr: 'Partie 3',
      en: 'Part 3'
    },
    shortTitles: {
      fr: 'x',
      en: 'x'
    },
    contents: {
      fr: Part3,
      en: Part3
    },
    Component: ScrollyPage,
    routeGroup: 'primary'
  },
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