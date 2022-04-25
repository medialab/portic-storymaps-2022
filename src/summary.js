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
import PartAbout from './content/fr/about.mdx';

export default [
    {
        routes: {
            fr: 'partie-0',
            en: 'part-0'
        },
        titles: {
            fr: 'Intro',
            en: 'Intro-en'
        },
        contents: {
            fr: frPart0,
            en: enPart0,
        },
        Component: ScrollyPage,
        routeGroup: 'intro',
        navGroup: 'primary'
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
            fr: 'Partie 2',
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
            fr: 'Partie 3',
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
            fr: 'a-propos',
            en: 'about'
        },
        titles: {
            fr: 'À propos',
            en: 'About'
        },
        contents: {
            fr: PartAbout,
            en: undefined
        },
        Component: PlainPage,
        routeGroup: 'secondary',
        navGroup: 'secondary'
    }
];