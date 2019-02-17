const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    './bundle3': ['./build-tsc/index.js'],
    './badges/badge/bundle3': ['./build-tsc/badges/badge/index.js'],
    './event/bundle3': ['./build-tsc/event/index.js']
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
