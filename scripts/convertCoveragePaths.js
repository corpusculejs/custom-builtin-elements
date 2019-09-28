/* eslint-disable no-console, no-process-exit */
const {readFile, writeFile} = require('fs');
const {EOL} = require('os');
const {relative, resolve, sep} = require('path');
const {promisify} = require('util');

const options = process.argv.slice(2);

const back = !!options.find(option => option.includes('--back'));
const files = options.filter(option => !option.includes('--'));

const cwd = process.cwd();
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const marker = '#URI#';

(async () => {
  try {
    await Promise.all(
      files.map(async file => {
        const filePath = resolve(cwd, file);
        const content = await readFileAsync(filePath, 'utf8');

        const lines = content.split(content.includes(EOL) ? EOL : '\n');
        const processedContent = new Array(lines.length);

        for (let i = 0, len = lines.length; i < len; i++) {
          let processedLine = lines[i];

          const index = lines[i].indexOf(back ? marker : cwd);

          if (index > -1) {
            const uri = lines[i].slice(index);
            const processedUri = back
              ? resolve(cwd, uri.slice(marker.length))
              : relative(cwd, uri)
                  .split(sep)
                  .join('/');
            processedLine =
              lines[i].slice(0, index) + (back ? '' : marker) + processedUri;
          }

          processedContent[i] = processedLine;
        }

        await writeFileAsync(filePath, processedContent.join('\n'), 'utf8');
        console.log(
          `Coverage paths in ${file} converted ${
            back ? 'back ' : ''
          }successfully`,
        );
      }),
    );
  } catch (e) {
    console.error(e.stack);
    process.exit(-1);
  }
})();
