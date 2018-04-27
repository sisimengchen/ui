const path = require('path');
const alias = require('rollup-plugin-alias');
const node = require('rollup-plugin-node-resolve');
const html = require('./rollup-plugin-html');
const postcss = require('rollup-plugin-postcss');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const version = process.env.VERSION || require('../package.json').version;
const aliases = require('./alias');

const env = process.env.NODE_ENV || 'development';

const resolve = p => path.resolve(__dirname, '../', p);

const builds = {
  'lmui-esm': {
    input: resolve('src/index.js'),
    amd: {
      id: 'lmfe.lmui'
    },
    name: 'LMUI',
    format: 'es'
  },
  'lmui': {
    input: resolve('src/index.js'),
    amd: {
      id: 'lmfe.lmui'
    },
    name: 'LMUI'
  },
  'actionsheet': {
    input: resolve('src/components/actionsheet/index.js'),
    amd: {
      id: 'lmfe.actionsheet'
    },
    name: 'Actionsheet'
  }
};

const resolveDist = (name) => {
  const dist = `${path.resolve(__dirname, '../dist/', name, 'index')}${env === 'development' ? '' : '.min'}`;
  return dist;
};

const getposetCss = (name) => {
  const cssnext = require('postcss-cssnext');
  const cssnano = require('cssnano');
  const config = {
    extract: `${resolveDist(name)}.css`,
    extensions: ['.less'],
    inject: false,
    sourceMap: false,
    use: ['less'],
    plugins: (function() {
      const plugins = [cssnext({ warnForDuplicates: false })];
      env === 'development' ? '' : plugins.push(cssnano());
      return plugins;
    })()
  };
  return config;
};

const getBabel = (name) => {
  const opts = builds[name];
  const format = opts.format || 'umd';
  if (format === 'es') {
    return null;
  } else {
    return {
      babelrc: false,
      compact: false,
      presets: [
        [
          'env',
          {
            modules: false
          }
        ]
      ],
      plugins: ['external-helpers']
    };
  }
};

function getConfig(name) {
  const opts = builds[name];
  const config = {
    inputOptions: {
      input: opts.input,
      plugins: (function() {
        const plugins = [node(), alias(aliases), postcss(getposetCss(name)), html()];
        const babelConfig = getBabel(name);
        babelConfig ? plugins.push(babel(babelConfig)) : '';
        env === 'development' ? '' : plugins.push(uglify());
        return plugins.concat(opts.plugins || []);
      })()
    },
    outputOptions: {
      file: `${resolveDist(name)}.js`,
      format: opts.format || 'umd',
      amd: opts.amd,
      name: opts.name || 'LMUI'
    }
  };
  return config;
}

module.exports = {
  getBuild: getConfig,
  getAllBuilds: () => Object.keys(builds).map(getConfig)
};
