const simplify = require('simplify-geojson')
const fs = require('fs-extra');
const turf = require('turf');

// let original = fs.readFileSync('./public/data/cartoweb_france_1789_geojson_original.geojson', 'utf8');
let output = `./datascripts/resources/intro_map.geojson`;
let original = fs.readFileSync('./datascripts/resources/intro_map_source.geojson', 'utf8');

let originalLength = original.length
console.log('length before : ', originalLength);
try {
  original = JSON.parse(original)
} catch(e) {
  console.log('damn')
}

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
// let simplified = simplify(original, .003); // works
let simplified = {
  ...original,
  features: original.features
  // .filter(feature => acceptedDominants.includes(feature.properties.dominant) || acceptedProvinces.includes(feature.properties.shortname))
  .map(inputFeature => {
    const feature = {
      ...inputFeature,
      properties: {
        id: inputFeature.id,
        shortname: inputFeature.shortname
      }
    }
    // handling a weird bug
    // if (feature.properties.shortname === 'Normandie') {
    //   return simplify(feature, .03);
    // // no simplification
    // } else if (['Poitou', 'Aunis', 'Saintonge', 'Bretagne', 'Anjou', 'Saumurois', 'Angoumois'].includes(feature.properties.shortname)) {
    //   return feature;
    // }
    // simplification maximum
    return feature;
    // return simplify(feature, .02); // works
    // return simplify(feature, .005); // works
  })
}


simplified = JSON.stringify(simplified);

console.log('length after : ', simplified.length, ', gain : ', -parseInt((1 - simplified.length / originalLength) * 100) + '%' );

fs.writeFileSync(output, simplified, 'utf8')

/**
 * PHYSICAL MAP
 */
original = fs.readFileSync('./datascripts/resources/physical_world_map.geojson', 'utf8');

originalLength = original.length
console.log('physical map : length before : ', originalLength);
try {
  original = JSON.parse(original)
} catch(e) {
  console.log('damn')
}
// let simplified = simplify(original, .003); // works
simplified = {
  ...original,
  features: original.features
  // .filter(feature => acceptedDominants.includes(feature.properties.dominant) || acceptedProvinces.includes(feature.properties.shortname))
  .map((feature, index) => {
    const area = turf.area(feature);
    if (area > 0) {
      try {
        // const simplified = turf.simplify(feature, 0.07);
        const simplified = turf.simplify(feature, 0.1);
        if ([1359, 1355, 1378].includes(index)) {
          return null;
        }
        // if (area > 12093433177500 ) {
        //   console.log(parseInt(turf.area(feature)))
        //   return null;
        // }
        return {
          // ...simplify(feature, 0.07), // works,
          // ...simplify(feature, .07), // works,
          ...simplified,
          properties: {
            id: index
          }
        }
      } catch(e) {
        return null;
      }
      
    }    
  })
  .filter(f => f)
}


simplified = JSON.stringify(simplified);

console.log('physical map, length after : ', simplified.length, ', gain : ', -parseInt((1 - simplified.length / originalLength) * 100) + '%' );

output = `./datascripts/resources/physical_world_map_simplified.geojson`;

fs.writeFileSync(output, simplified, 'utf8')