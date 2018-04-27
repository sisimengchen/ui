const rollupPluginutils = require('rollup-pluginutils');
const path = require('path');
const htmlMinifier = require('html-minifier');
module.exports = function(options = {}) {
  // 包含路径
  var include = options.include || 'src/**';
  // 排除路径
  var exclude = options.exclude || 'node_modules/**';
  var filter = rollupPluginutils.createFilter(include, exclude);
  // 扩展名参数
  var extensions = options.extensions || ['.html'];
  //   var eslint = require("eslint");
  //   var cli = new eslint.CLIEngine();
  //   var formatter = cli.getFormatter("stylish");
  return {
    name: 'html',
    intro: function(intro) {
      console.log('intro', intro);
    },
    options: function(opts) {
      //   console.log("options", opts);
    },
    resolveId: function(id) {
      console.log('resolveId', id);
    },
    load: async function(id) {
      console.log('load', id);
    },
    transform: async function(code, id) {
      // console.log("transform", code, id);
      if (!filter(id)) {
        return null;
      }
      if (extensions.indexOf(path.extname(id)) === -1) {
        return null;
      }
      return {
        code: `export default '${htmlMinifier.minify(code, {
          removeComments: true,
          removeCommentsFromCDATA: true,
          removeCDATASectionsFromCDATA: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          useShortDoctype: true,
          keepClosingSlash: true,
          collapseWhitespace: true,
          minifyJS: true,
          minifyCSS: true,
          removeScriptTypeAttributes: true,
          removeStyleTypeAttributes: true
        })}';`,
        map: null
      };
    },
    onwrite: async function(opts) {
      //   console.log("onwrite", opts);
    },
    ongenerate: function(id) {
      //   console.log("ongenerate", id);
    }
  };
};
