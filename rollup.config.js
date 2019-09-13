const babel = require('rollup-plugin-babel');
const cleanup = require('rollup-plugin-cleanup');
const nodeResolve = require('rollup-plugin-node-resolve');

const plugins = [
  nodeResolve(),
  babel(),
  cleanup({
    comments: 'none',
  }),
];

module.exports = [
  {
    input: 'src/index.js',
    output: {
      file: 'lib/customBuiltInElements.js',
      format: 'iife',
      name: 'customBuiltInElements',
    },
    plugins,
    treeshake: false,
  },
  {
    input: 'src/customElementsBase.js',
    output: {
      file: 'lib/customElementsBase.js',
      format: 'iife',
      name: 'customElementsBase',
    },
    plugins,
    treeshake: false,
  },
];
