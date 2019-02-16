const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: "source-map",
  entry: ['babel-polyfill', './build-babel/index.js'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'functions/dist')
  },
  plugins: [
    new CopyWebpackPlugin([
        { from: path.resolve(__dirname, '../sol-contract/abi'), to: path.resolve(__dirname, 'functions/abi') }
    ])
  ]
};
