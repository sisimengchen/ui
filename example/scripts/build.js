'use strict';

process.env.NODE_ENV = 'production';

const chalk = require('chalk');
const webpack = require('webpack');
const webpackConfig = require('./config');

const compiler = webpack(webpackConfig);

compiler.run((err, stats) => {
  if (err) {
    throw err;
  }
  process.stdout.write(`${stats.toString({
    colors: true,
    modules: false,
    children: false, // if you are using ts-loader, setting this to true will make tyescript errors show up during build
    chunks: false,
    chunkModules: false
  })}\n\n`);
  if (stats.hasErrors()) {
    console.log(chalk.red('  Build failed with errors.\n'));
    process.exit(1);
  }
  console.log(chalk.cyan('  Build complete.\n'));
  console.log(chalk.yellow('  Tip: built files are meant to be served over an HTTP server.\n' +
        "  Opening index.html over file:// won't work.\n"));
});
