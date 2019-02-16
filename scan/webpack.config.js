const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: "source-map",
  entry: {
    './bundle': ['babel-polyfill','./build-babel/index.js'],
    './badges/badge/bundle': ['babel-polyfill','./build-babel/badges/badge/index.js'],
    './event/bundle': ['babel-polyfill','./build-babel/event/index.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CopyWebpackPlugin([
        { from: path.resolve(__dirname, '../sol-contract/abi'), to: path.resolve(__dirname, 'abi') }
    ])
  ]
};
