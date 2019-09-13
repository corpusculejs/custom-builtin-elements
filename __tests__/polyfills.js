import Promise from 'core-js-pure/es/promise';
import Symbol from 'core-js-pure/es/symbol';

if (!('Promise' in window)) {
  window.Promise = Promise;
}

if (!('Symbol' in window)) {
  window.Symbol = Symbol;
}
