const babel = require('rollup-plugin-babel');
const cleanup = require('rollup-plugin-cleanup');
const nodeResolve = require('rollup-plugin-node-resolve');

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'lib/customBuiltInElements.js',
    format: 'iife',
    name: 'customBuiltInElements',
  },
  plugins: [
    nodeResolve(),
    babel(),
    cleanup({
      comments: 'none',
    }),
  ],
  treeshake: false,
};
