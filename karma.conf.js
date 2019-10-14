/* eslint-disable sort-keys, global-require */
const {readFileSync} = require('fs');
const {resolve} = require('path');

const {CI} = process.env;

const isCI = !!CI;

const watch = !!process.argv.find(arg => arg.includes('watch')) && !isCI;
const coverage = !!process.argv.find(arg => arg.includes('--coverage'));

const babelrc = JSON.parse(
  readFileSync(resolve(process.cwd(), '.babelrc'), 'utf8'),
);

module.exports = config => {
  config.set({
    basePath: '',

    plugins: [
      require('karma-chrome-launcher'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-detect-browsers'),
      require('karma-edge-launcher'),
      require('karma-jasmine'),
      require('karma-ie-launcher'),
      require('karma-rollup-preprocessor'),
      require('karma-safarinative-launcher'),
    ],

    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    captureTimeout: 60000,

    frameworks: ['jasmine', 'detectBrowsers'].filter(Boolean),

    files: [
      {pattern: '__tests__/polyfills.js', watched: false},
      {pattern: 'src/customElementsBase.js', watched: false},
      {pattern: '__tests__/sources.js', watched: false},
      {pattern: 'src/index.js', watched: false, included: false},
      {pattern: '__tests__/index.js', watched: false},
    ],

    exclude: [],

    preprocessors: {
      '__tests__/polyfills.js': ['rollup'],
      '__tests__/sources.js': ['sourceRollup'],
      'src/customElementsBase.js': ['sourceRollup'],
      'src/index.js': ['sourceRollup'],
      '__tests__/index.js': ['rollup'],
    },

    reporters: ['progress', coverage && 'coverage-istanbul'].filter(Boolean),

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

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
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
            ...babelrc.plugins,
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

    customPreprocessors: {
      sourceRollup: {
        base: 'rollup',
        options: {
          plugins: [
            require('rollup-plugin-node-resolve')(),
            require('rollup-plugin-babel')({
              babelrc: false,
              ...babelrc,
              plugins: [
                ...babelrc.plugins,
                coverage && 'babel-plugin-istanbul',
              ].filter(Boolean),
            }),
          ],
          treeshake: false,
        },
      },
    },

    detectBrowsers: {
      postDetection(availableBrowsers) {
        // Firefox has all the features implemented as well as Chrome, so Chrome
        // is enough
        let preparedBrowsers = availableBrowsers.filter(
          browser => browser !== 'FirefoxHeadless',
        );

        if (isCI) {
          // The stable Edge is not supported by Github CI
          preparedBrowsers = preparedBrowsers.filter(
            browser => browser !== 'Edge',
          );

          const chromeIndex = preparedBrowsers.indexOf('ChromeHeadless');

          if (chromeIndex > -1) {
            preparedBrowsers[chromeIndex] = 'ChromeHeadlessNoSandbox';
          }
        }

        return preparedBrowsers;
      },
      preferHeadless: true,
      usePhantomJS: false,
    },

    singleRun: !watch,
    concurrency: Infinity,
  });
};
