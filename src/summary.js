/* eslint import/no-webpack-loader-syntax : 0 */
import ScrollyPage from './components/ScrollyPage';
import PlainPage from './components/PlainPage';

// import PartHome from './contents/home.mdx';
import frPart0 from './content/fr/part-0.mdx';
import frPart1 from './content/fr/part-1.mdx';
import frPart2 from './content/fr/part-2.mdx';
import frPart3 from './content/fr/part-3.mdx';

import enPart0 from './content/en/part-0.mdx';
import enPart1 from './content/en/part-1.mdx';
import enPart2 from './content/en/part-2.mdx';
import enPart3 from './content/en/part-3.mdx';

import frConclusion from './content/fr/part-4.mdx';
import frMethodo from './content/fr/part-5.mdx';
// import frAnnexes from './content/fr/part-6.mdx';
import frAbout from './content/fr/part-6.mdx';
import enAbout from './content/en/part-6.mdx';
import frBiblio from './content/fr/part-7.mdx';
import enBiblio from './content/en/part-7.mdx';

import enConclusion from './content/en/part-4.mdx';
import enMethodo from './content/en/part-5.mdx';

export default [
  {
    routes: {
      fr: 'partie-1',
      en: 'part-1'
    },
    titles: {
      fr: 'I. Dunkerque et sa navigation au XVIIIe siècle',
      en: 'I. Dunkirk and its shipping in the 18th century'
    },
    contents: {
      fr: frPart1,
      en: enPart1
    },
    Component: ScrollyPage,
    routeGroup: 'chapter',
    navGroup: 'primary'
  },
  {
    routes: {
      fr: 'partie-2',
      en: 'part-2'
    },
    titles: {
      fr: 'II. Dunkerque, un port pour la contrebande vers l’Angleterre ?',
      en: 'II. Dunkirk, a port for smuggling to England?'
    },
    contents: {
      fr: frPart2,
      en: enPart2
    },
    Component: ScrollyPage,
    routeGroup: 'chapter',
    navGroup: 'primary'
  },
  {
    routes: {
      fr: 'partie-3',
      en: 'part-3'
    },
    titles: {
      fr: 'III. Port d\'entrepôt européen ou port fraudeur ?',
      en: 'III. European staple port or smuggling port?'
    },
    contents: {
      fr: frPart3,
      en: enPart3
    },
    Component: ScrollyPage,
    routeGroup: 'chapter',
    navGroup: 'primary'
  },
  {
    routes: {
      fr: 'conclusion',
      en: 'conclusion-english'
    },
    titles: {
      fr: 'Conclusion',
      en: 'Conclusion'
    },
    contents: {
      fr: frConclusion,
      en: enConclusion
    },
    Component: PlainPage,
    routeGroup: 'chapter',
    navGroup: 'primary'
  },
  {
    routes: {
      fr: 'annexes',
      en: 'appendix'
    },
    titles: {
      fr: 'Annexes',
      en: 'Appendix'
    },
    contents: {
      fr: frMethodo,
      en: enMethodo
    },
    Component: ScrollyPage,
    routeGroup: 'secondary',
    navGroup: 'secondary'
  },
  {
    routes: {
      fr: 'sources-et-biblio',
      en: 'sources-and-ref'
    },
    titles: {
      fr: 'Sources & bib.',
      en: 'Sources & ref.'
    },
    contents: {
      fr: frBiblio,
      en: enBiblio
    },
    Component: PlainPage,
    routeGroup: 'secondary',
    navGroup: 'secondary'
  },
  {
    routes: {
      fr: 'a-propos',
      en: 'about'
    },
    titles: {
      fr: 'À propos',
      en: 'About'
    },
    contents: {
      fr: frAbout,
      en: enAbout
    },
    Component: PlainPage,
    routeGroup: 'secondary',
    navGroup: 'secondary'
  },
  
];