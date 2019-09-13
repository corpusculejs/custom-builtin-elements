/* eslint-disable no-console, no-process-exit */
const {mkdir, writeFile} = require('fs');
const {dirname, resolve} = require('path');
const {rollup} = require('rollup');
const {promisify} = require('util');
const configs = require('../rollup.config');

const mkdirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);

const cwd = process.cwd();
const detection = '  if (detect()) { return; }';

(async () => {
  try {
    await Promise.all(
      configs.map(async (config, index) => {
        const bundle = await rollup(config);
        const generated = await bundle.generate(config.output);
        let {
          output: [{code}],
        } = generated;

        if (index === 0) {
          const [first, second, ...other] = code.split('\n');
          code = [first, second, detection, ...other].join('\n');
        }

        const resultFile = resolve(cwd, config.output.file);

        await mkdirAsync(dirname(resultFile), {recursive: true});
        await writeFileAsync(resultFile, code, 'utf8');
      }),
    );
  } catch (e) {
    console.error(e.stack);
    process.exit(1);
  }
})();
