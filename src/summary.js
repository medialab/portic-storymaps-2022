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
import frAbout from './content/fr/part-6.mdx';
import frBiblio from './content/fr/part-8.mdx';

export default [
  {
    routes: {
      fr: 'partie-1',
      en: 'part-1'
    },
    titles: {
      fr: 'I. Dunkerque et sa navigation au XVIIIe siècle',
      en: 'Part 1'
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
      fr: 'II. Le Smogglage',
      en: 'Part 2'
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
      fr: 'III. Un port d\'entrepôt pour l\'Europe',
      en: 'Part 3'
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
      en: 'conclusion'
    },
    titles: {
      fr: 'Conclusion',
      en: 'Conclusion'
    },
    contents: {
      fr: frConclusion,
      en: frConclusion
    },
    Component: PlainPage,
    routeGroup: 'chapter',
    navGroup: 'primary'
  },
  {
    routes: {
      fr: 'methodologie',
      en: 'methodology'
    },
    titles: {
      fr: 'Méthodologie',
      en: 'Methodology'
    },
    contents: {
      fr: frMethodo,
      en: frMethodo
    },
    Component: ScrollyPage,
    routeGroup: 'secondary',
    navGroup: 'secondary'
  },
  {
    routes: {
      fr: 'sources',
      en: 'sources'
    },
    titles: {
      fr: 'Sources',
      en: 'Sources'
    },
    contents: {
      fr: frBiblio,
      en: frBiblio
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
      en: frAbout
    },
    Component: PlainPage,
    routeGroup: 'secondary',
    navGroup: 'secondary'
  }
];