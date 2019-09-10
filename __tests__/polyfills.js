import Promise from 'core-js-pure/es/promise';
import Symbol from 'core-js-pure/es/symbol';
import WeakSet from 'core-js-pure/es/weak-set';

if (!('customElements' in window)) {
  const noop = () => {};

  window.customElements = {
    define: noop,
    get: noop,
    upgrade: noop,
    whenDefined: noop,
  };
}

if (!('Promise' in window)) {
  window.Promise = Promise;
}

if (!('Symbol' in window)) {
  window.Symbol = Symbol;
}

if (!('WeakSet' in window)) {
  window.WeakSet = WeakSet;
}
