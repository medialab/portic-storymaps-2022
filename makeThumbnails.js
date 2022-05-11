const path = require('path')
    , fs = require('fs')
    , Webpack = require('webpack')
    , WebpackDevServer = require('webpack-dev-server');

const config = require('./webpack.config.dev')
    , compiler = Webpack(config)
    , devServerOptions = {
        ...config.devServer,
        open: false,
        client: {
            logging: 'none'
        }
    }
    , server = new WebpackDevServer(devServerOptions, compiler);

const puppeteer = require('puppeteer');
const visualizationsMetas = require('./src/data/viz.json');

const vizList = Object.keys(visualizationsMetas);
const langFlags = ['fr', 'en'];
const basePath = path.join(__dirname, 'public');

[
    path.join(basePath, 'thumbnails'),
    path.join(basePath, 'thumbnails', 'fr'),
    path.join(basePath, 'thumbnails', 'en')
].forEach((pathToLangDir) => {
    if (fs.existsSync(pathToLangDir) === false) {
        fs.mkdirSync(pathToLangDir);
    }
});

(async () => {
    await server.start();
    const browser = await puppeteer.launch({
        // headless: false
    });

    console.log('preparation');

    for (const vizId of vizList) {
        console.log('screenshot for ', vizId);
        for (const lang of langFlags) {
            const page = await browser.newPage();
            await page.setViewport({
                width: 1200,
                height: 800,
                deviceScaleFactor: 1,
            });

            const pathToSave = path.join(basePath, 'thumbnails', lang, `${vizId}.png`)
            const url = `http://localhost:${devServerOptions.port}/#/${lang}/vizualisation/${vizId}`;

            await page.goto(url);
            await page.waitForSelector('.viz-render', {
                visible: true,
            });
            await page.screenshot({ 
                path: pathToSave,
                fullPage: true
            });
            await page.close();
        }
    }

    await browser.close();
    await server.stop();
})();