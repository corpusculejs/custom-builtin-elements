/* eslint-disable class-methods-use-this */
import Promise from 'core-js-pure/es/promise';
import Symbol from 'core-js-pure/es/symbol';
import WeakSet from 'core-js-pure/es/weak-set';

if (!('Promise' in window)) {
  window.Promise = Promise;
}

if (!('Symbol' in window)) {
  window.Symbol = Symbol;
}

if (!('WeakSet' in window)) {
  window.WeakSet = WeakSet;
}
