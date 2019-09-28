/* eslint-disable no-console, no-process-exit */
const {readFile, writeFile} = require('fs');
const {EOL} = require('os');
const {relative, resolve} = require('path');
const {promisify} = require('util');

const cwd = process.cwd();
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const {GITHUB_WORKSPACE} = process.env;

(async () => {
  try {
    const filePath = resolve(cwd, '.coverage/lcov.info');
    const content = await readFileAsync(filePath, 'utf8');

    const lines = content.split(content.includes(EOL) ? EOL : '\n');
    const processedContent = new Array(lines.length);

    for (let i = 0, len = lines.length; i < len; i++) {
      let processedLine = lines[i];
      const index = lines[i].indexOf(GITHUB_WORKSPACE);

      if (index > -1) {
        const uri = lines[i].slice(index);
        const processedUri = relative(cwd, uri);
        processedLine = lines[i].slice(0, index) + processedUri;
      }

      processedContent[i] = processedLine;
    }

    await writeFileAsync(filePath, processedContent.join('\n'), 'utf8');
  } catch (e) {
    console.error(e.stack);
    process.exit(-1);
  }
})();
