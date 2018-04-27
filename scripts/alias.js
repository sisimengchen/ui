const path = require('path');

const resolve = p => path.resolve(__dirname, '../', p);

module.exports = {
  '@common': resolve('src/common'),
  '@util': resolve('src/util/index'),
  '@components': resolve('src/components'),
  '@lmui': resolve('src')
};
