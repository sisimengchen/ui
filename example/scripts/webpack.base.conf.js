'use strict';
const path = require('path');
const config = require('../config');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: resolve('src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath
    // libraryTarget: 'umd',
    // library: {
    //   root: '[name]',
    //   amd: 'lmfe.[name]',
    //   commonjs: 'lmfe.[name]'
    // },
    // umdNamedDefine: true
  },
  resolve: {
    extensions: ['.js', '.less'],
    alias: {
      '@util': resolve('src/util/index'),
      '@lmui': resolve('../dist/lmui-esm')
    }
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   loader: 'eslint-loader',
      //   enforce: 'pre',
      //   include: [resolve('src'), resolve('example')]
      // },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('../dist')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        include: [resolve('src')]
        // options: {
        //     // minimize: true
        // }
      }
    ]
  }
};
