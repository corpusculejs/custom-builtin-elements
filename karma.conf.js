/* eslint-disable sort-keys, global-require */
const {readFileSync} = require('fs');
const {resolve} = require('path');

const {CI, TRAVIS_OS_NAME} = process.env;

const isCI = !!CI;
const isWindows = TRAVIS_OS_NAME === 'windows';
const isOsx = TRAVIS_OS_NAME === 'osx';

const watch = !!process.argv.find(arg => arg.includes('watch')) && !isCI;
const coverage = !!process.argv.find(arg => arg.includes('--coverage'));

const babelrc = JSON.parse(
  readFileSync(resolve(process.cwd(), '.babelrc'), 'utf8'),
);

module.exports = config => {
  config.set({
    basePath: '',

    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-safarinative-launcher'),
      require('karma-ie-launcher'),
      require('karma-edge-launcher'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-rollup-preprocessor'),
      require('karma-babel-preprocessor'),
    ],

    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    captureTimeout: 60000,

    frameworks: ['jasmine', 'detectBrowsers'],

    files: [
      {pattern: '__tests__/polyfills.js', watched: false},
      'lib/customBuiltInElements.js',
      {pattern: '__tests__/index.js', watched: false},
    ],

    exclude: [],

    preprocessors: {
      '__tests__/polyfills.js': ['rollup'],
      'lib/customBuiltInElements.js': coverage ? ['babel'] : [],
      '__tests__/index.js': ['rollup'],
    },

    reporters: coverage ? ['progress', 'coverage-istanbul'] : ['progress'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: watch,

    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly'],
      dir: '.coverage',
      combineBrowserReports: true,
      skipFilesWithNoCoverage: true,
      'report-config': {
        html: {subdir: 'html'},
        lcovonly: {subdir: 'lcov'},
      },
    },

    browsers: isCI
      ? [
          isOsx && 'ChromeHeadlessNoSandbox',
          isOsx && 'Safari',
          isWindows && 'Edge',
          isWindows && 'IE',
        ].filter(Boolean)
      : ['ChromeHeadless', 'Edge', 'IE'],

    customLaunchers: {
      Safari: {
        base: 'SafariNative',
      },
    },

    rollupPreprocessor: {
      plugins: [
        require('rollup-plugin-commonjs')({
          include: 'node_modules/**',
          exclude: 'node_modules/@open-wc/**',
        }),
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-babel')({
          babelrc: false,
          include: ['node_modules/@open-wc/**', '__tests__/**'],
          ...babelrc,
          plugins: [
            '@babel/plugin-transform-instanceof',
            'babel-plugin-transform-async-to-promises',
          ],
        }),
      ],
      output: {
        format: 'iife',
        name: 'customBuiltInElements',
      },
    },

    babelPreprocessor: {
      options: {
        plugins: ['babel-plugin-istanbul'],
        sourceMap: 'inline',
      },
    },

    singleRun: !watch,
    concurrency: Infinity,
  });
};
