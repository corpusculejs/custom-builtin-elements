import detect from '../src/detect';

if (!detect()) {
  document.write('<script src="/base/src/index.js"></script>');
}
