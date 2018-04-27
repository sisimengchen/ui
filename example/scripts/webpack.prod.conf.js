'use strict';
const path = require('path');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const extractLess = new ExtractTextPlugin({
  filename: 'index.css',
  allChunks: true
});

const env = process.env.NODE_ENV === 'testing' ? require('../config/test.env') : require('../config/prod.env');

const webpackConfig = merge(baseWebpackConfig, {
  output: {
    path: config.build.assetsRoot
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: extractLess.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: config.build.cssSourceMap
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: loader => [require('postcss-cssnext')()],
                sourceMap: config.build.cssSourceMap
              }
            },
            {
              loader: 'less-loader',
              options: {
                sourceMap: config.build.cssSourceMap
              }
            }
          ],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: config.dev.cssSourceMap
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: loader => [require('postcss-cssnext')()],
              sourceMap: config.dev.cssSourceMap
            }
          }
        ]
      }
    ]
  },
  devtool: config.build.cssSourceMap ? config.build.devtool : false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env
    }),
    extractLess,
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.cssSourceMap ? { safe: true, map: { inline: false } } : { safe: true }
    }),
    // new UglifyJsPlugin({
    //   sourceMap: true
    // }),
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing' ? 'index.html' : config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency'
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.SplitChunksPlugin({
      chunks: 'all',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: true
    })
  ]
});

module.exports = webpackConfig;
