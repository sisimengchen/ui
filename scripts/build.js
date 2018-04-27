const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const { getBuild, getAllBuilds } = require('./config');

async function build(name) {
  const { inputOptions, outputOptions } = getBuild(name);
  const { file } = outputOptions;
  try {
    const bundle = await rollup.rollup(inputOptions);
    const { code, map } = await bundle.generate(outputOptions);
    await bundle.write(outputOptions);
  } catch (e) {
    console.error(e);
  }
}
const target = process.env.TARGET || 'lmui-esm';

build(target);
