const fs = require('fs');
const path = require('path');
const parseSVG = require('parse-svg')
const geojson2svg = require('geojson2svg');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const pathPublic = path.join(__dirname, 'public/data')

let svgElements = [];

fs.readFile(path.join(pathPublic, 'world_map.geojson'), (err, data) => {
  if (err) { return console.error('Error read file'); }
  data = JSON.parse(data.toString());
  const converter = geojson2svg({
    viewportSize: { width: 1200, height: 1200 },
    attributes: {
      'style': 'stroke:#000; fill: #F0F8FF;stroke-width:0.5px;',
    },
    explode: false
  });
  const svgStrings = converter.convert(data, {});
  // const svgElement = dom.window.document.querySelector('svg')
  for (const svgElement of svgStrings) {
    console.log(svgElement);
    svgElements.push(svgElement);
  }

  let dom = new JSDOM(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200">${svgElements.join('')}</svg>`);
  dom = dom.serialize()

  fs.writeFile(path.join(pathPublic, 'world_map.html'), dom, 'utf-8', err => console.error(err))
})