const path = require('path')
    , HtmlWebpackPlugin = require('html-webpack-plugin')
    // , CopyPlugin = require("copy-webpack-plugin");

const webpack = require('webpack')
    , { homepage } = require('./package.json');

module.exports = {
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        // new CopyPlugin({
        //     patterns: [
        //         { from: "./public/data", to: "./data" },
        //     ],
        // }),
        new webpack.DefinePlugin({
            'process.env.BASE_PATH': JSON.stringify(homepage)
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.csv$/,
                loader: 'csv-loader',
                options: {
                    dynamicTyping: true,
                    header: true,
                    skipEmptyLines: true
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-react', {"runtime": "automatic"}]]
                    }
                }
            }
        ]
    },
    mode: 'production'
};