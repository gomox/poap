const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: "source-map",
  entry: {
    './bundle': ['babel-polyfill','./build-babel/index.js'],
    './claim/bundle': ['babel-polyfill','./build-babel/claim/index.js']
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
