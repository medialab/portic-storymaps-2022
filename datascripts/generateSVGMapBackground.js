
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const simplify = require('simplify-geojson')

/** URL of the geojson for full map to be used for generating the background svg */
const FULL_MAP_URL = 'https://raw.githubusercontent.com/medialab/portic-storymaps-2021/main/public/data/map_backgrounds/map_cartoweb_world_1789_29juillet2021_mixte4326_geojson_UTF8.geojson';
const SVG_OUTPUT_FOLDER_PATH = path.resolve(__dirname + '/../public/data/map_backgrounds/');
const SVG_OUTPUT_FILENAME = '/world_map.svg';
const width = 960;
const height = 500;

const generateSVGMapBackground = async () => {
  const { geoPath, geoMercator } = await import('d3-geo');
  let chalk = await import('chalk');
  chalk = chalk.default;

  let geoJSONData;
  let originalLength;
  let svgStr;
  console.log(chalk.blue('fetch geojson map background'));
  axios(FULL_MAP_URL)
  .then(({data}) => {
    originalLength = JSON.stringify(data).length;
    console.log(chalk.green('geojson map background successfully fetched'));
    console.log(chalk.blue('simplifying the map to lighten output svg'));
    const acceptedProvinces = [
      'Espagne', 
      'Grande-Bretagne', 
      'Isles de Corse',
      'Sardaigne',
      'Royaume de Piémont-Sardaigne',
      'République de Gènes',
      'Duché de Massa et Carrare',
      'Toscane',
      'Pays-Bas autrichiens',
      'Liège',
      'Swiss Cantons',
      "Autriche",
      'Small States',
      'Württemberg',
      'Nassau',
      'Trier',
      'Wittelsbach',
      'Cologne',
      'Hesse-Darmstadt',
      'Prusse',
      'Hanover',
      'République de Lucques',
      'Etats pontificaux',
      'République de Venise',
      'Bavaria',
      'Saxony-Poland-Lithuania',
      'Portugal',
      'Parma Piacenza',
      'Modena',
      'Hesse-Kassel',
      'Brandenburg-Bayreuth',
      'Salzburg',
      'Meiningen',
      'Eisenach',
      'Brandenburg-Ansbach',
      'Nuremberg',
      'Porrentruy',
      'Baden',
      'Mainz',
      'Andorra',
      'Brunswick-Wolfenbuttel',
      'Coburg',
      'Saxe-Hildburghausen',
      'Altenburg',
      'Waldeck',
      'Lippe',
      'Zerbst',
      'Dessau',
      'Köthen',
      'Bernburg',
      'Schwabisches Hall',
      'Rothenburg',
      'Sulzbach',
      'Weimar',
      'Mühlhausen',
      'Rottweil',
      'Sigmaringen',
      'Zweibrücken',
      'Überlingen',
      'Hechingen',
      'Orange'

    ]
    const acceptedDominants = [
      'France',
      'Royaume de Piémont-Sardaigne',
      'Provinces-Unies'
    ];
    const original = data;
    let simplified = {
      ...original,
      features: original.features
      // activate the following line to filter to france and neighbours only
      // .filter(feature => acceptedDominants.includes(feature.properties.dominant) || acceptedProvinces.includes(feature.properties.shortname))
      .map(feature => {
        if (['Normandie', 'Grande-Bretagne', 'Picardie', 'Bretagne'].includes(feature.properties.shortname)) {
          return feature;
        }
        // simplification maximum
        // return simplify(feature, .05); // works
        return simplify(feature, .1); // works
        // return simplify(feature, .005); // works
      })
    }
    geoJSONData = simplified;
    console.log(chalk.green('Successfully simplified the map, from ' + originalLength + ' characters to ' + JSON.stringify(simplified).length + ' characters'))
    console.log(chalk.blue('generating the paths for each geojson object'));
    const {features} = geoJSONData;
    const projection = geoMercator().scale(100);
    const geoGenerator = geoPath(projection);
    const paths = features.map((d, i) => {
      console.log('process %s / %s', i + 1, features.length);
      return geoGenerator(d)
    });

    const referencePoint = [0, 0];
    const referencePointPosition = projection(referencePoint);
    console.log(chalk.blue('reference point (null island) screen coordinates : ' + referencePointPosition.join(',')));
    // console.log(paths);
    svgStr = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    ${
      paths.map((pathD, i) => `<path class="${features[i].properties.dominant} ${features[i].properties.shortname}" title="${features[i].properties.shortname}" d="${pathD}"></path>`).join('')
    }
    
  </svg>
  `;
  console.log(chalk.green('svg str successfully prepared'));
  console.log(chalk.blue('writing the svg at ' + SVG_OUTPUT_FOLDER_PATH + SVG_OUTPUT_FILENAME));
    return fs.ensureDir(SVG_OUTPUT_FOLDER_PATH)
  })
  .then(() => {
    return fs.writeFile(SVG_OUTPUT_FOLDER_PATH + SVG_OUTPUT_FILENAME, svgStr, 'utf-8')
  })
  .then(() => {
    console.log(chalk.green('file successfully written at ' + SVG_OUTPUT_FOLDER_PATH + SVG_OUTPUT_FILENAME));
    console.log(chalk.green('all done, bye!'));
  })
  .catch(error => {
    console.log('Error :');
    console.log(error)
  })
}

generateSVGMapBackground()
