# Portic storymaps 2021 : "Commerce, contrebande et ports francs : le cas de Dunkerque au XVIIIe siècle"

![Screenshot of the website](https://medialab.github.io/portic-storymaps-2022/thumbnails/dunkerque-rs.png)

This repository hosts the source code of PORTIC research program's first case study (see [PORTIC homepage](https://anr.portic.fr/) for more information). Built by an interdisciplinary team of historians, engineers and designers, it proposes a detailed study of the economic history of the region of La Rochelle (France) circa 1789.

Through a series of three "storymaps" combining text and visualization, this publication tells the story of the Dunkerque port trade at the dawn of french revolution. It also features an atlas allowing to browse and share individually all the visualizations crafted during this research.

This project rests on the shoulders of two existing digital history projects : [Toflit18](http://toflit18.medialab.sciences-po.fr/#/home) and [Navigo](http://navigocorpus.org/).

# Installation

Prerequisites:

* install [Node.js](https://nodejs.org/)
* install [Python](https://www.python.org/)
* install [Pypi](https://pypi.org/)
* install [Yarn](https://yarnpkg.com/)
* install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

Then in a shell terminal, copy the following commands and hit enter:

```bash
yarn
sh install.sh
yarn run thumbnails
```

# Development

Use following command.


```bash
yarn dev
```

# Maintenance

Regularly update the data with the following command.

```bash
sh retrieve_data.sh
```

You can update the thumbnails with the following command. Warning: thumbnails building can be capricious on some machines. Backup existing screenshots from `public/thumbnails` before re-running this script.

```bash
yarn thumbnails
```

# Contributing

The project is open to contribution through pull requests.

## Suggested guidelines for commiting to the repository

- the `main` branch is the principal branch for the website version under development. Suggested workflow for contributing to the code is : for project members, to develop new features in a separated branch, then to merge it in `main` branch when it is ready ; for external person, to clone it then to submit a pull request with your modifications.
- it is suggested to use imperative tense verbs and explicit features/bugs mentions in commit messages (see [this guide](https://gist.github.com/luismts/495d982e8c5b1a0ced4a57cf3d93cf60) for optimal commit messages)
- it is suggested to reference related issue in commit messages in order to keep track of commits related to an issue in particular.

## Guidelines concerning code development and modification

- reusable components should go into `src/components` folder. Each component should have its own folder with an `index.js` file, plus as many files as you want (js subcomponent files, scss files, component-specific assets, ...)
- components aimed at being directly used for specific visualizations should go in the `src/visualizations` folder. They should use reusable components from `src/components` as much as possible.
- style is managed through scss files. It is suggested to use existing variables in `src/variables.scss` as much as possible, and to add a `.scss` file specific to each new component with its non-reusable styling rules (if any).

## Also read

- [Translate the app](./src/i18n/README.md)
- [Translate the app](./datascripts/README.md)

# App architecture

## Front-end : bundling React scripts

The application is bundled with [Webpack](https://webpack.js.org/). The root file is `/index.js`. It is in this file that must be imported all the JavaScript scripts that compose the application.

The [React](https://reactjs.org/) library (v.17+) is configured in the project, as well as other bundling tools. You can integrate React scripts, `.scss` styles, `.yml` files from the root `/index.js` file.

The [React router](https://reactrouter.com/) (v6+) development tool allows you to redirect the user to activate certain display scripts based on the page address and the parameters entered. The page address is used as a source of truth, for the active language and the texts, visualizations to be displayed.

## Back-end : compute data

The data is downloaded and processed with Python and NodeJs scripts in the `/datascript/` directory.

The shell script `/retrieve_data.sh` does three things. First it will download the data files from the two databases [Toflit18](http://toflit18.medialab.sciences-po.fr/#/home) and [Navigo](http://navigocorpus.org/). Then it will activate the script `/datascript/_fetch_content.py` which allows to find texts and data stored on the Google Drive of SciencesPo, on the [Zotero library](https://www.zotero.org/groups/4690289/portic-storymap-2022/library). Finally, it activates a series of Python and NodeJS scripts to process all the downloaded data.

This data allows to generate the text content of the application, as well as the visualizations. It is useful for both the development and the production of the application.

| data type               | source                | target                | integration on app | downloading                   |
|-------------------------|-----------------------|-----------------------|--------------------|-------------------------------|
| navigo database         | data.portic.fr/api/   | /data/*.csv           |                    | /retrieve_data.sh             |
| toflit database         | GitHub                | /data/*.csv           |                    | /retrieve_data.sh             |
| spreadsheets            | Google Drive (GSheet) | /public/data/**/*.csv | HTTP GET           | /datascript/_fetch_content.py |
| index of visualisations | Google Drive          | /src/data/viz.json    | ES6 import         | /datascript/_fetch_content.py |
| bibliography            | Zotero                | /src/data/bib.json    |                    | /datascript/_fetch_content.py |
| texts                   | Google Drive (GDoc)   | /src/content/**/*.mdx | /src/summary.js    | /datascript/_fetch_content.py |

## Middle : view data

The visualizations index `/src/data/viz.json` contains the names of the `.csv` data files to be loaded via HTTP GET for each visualization. The `/src/visualizations/index.js` file centralizes all calls to the visualization components. It also automatically passes them the data as prescribed by the index of the visualizations. For this, the columns 'id' and 'n_chapter' must match the caller of the visualization. Below the visualization 'id' === 'history-dunkerque' && 'n_chapter' === 1.

```md
Part 1
---

Lorem ipsum dolor est.

<Caller id=”histoire-dunkerque” />
```

# Deployment

Deployment used to be automated to happen every day and each time a commit is pushed to the `prod` branch. The published website was then pushed on the `gh-pages` branch, which serves the site at https://medialab.github.io/portic-storymaps-2022/. It is now only updated when pushing on the `prod` branch. To deploy a new version of the website code, it has to be pushed to the `prod` branch.