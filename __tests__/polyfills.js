/* eslint-disable class-methods-use-this */
import Promise from 'core-js-pure/es/promise';
import Symbol from 'core-js-pure/es/symbol';
import WeakSet from 'core-js-pure/es/weak-set';

if (!('customElements' in window)) {
  const fn = () => {
    throw new Error('Not supported in this environment');
  };

  window.customElements = {
    define: fn,
    get: fn,
    upgrade: fn,
    whenDefined: fn,
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
