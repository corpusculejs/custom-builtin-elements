# @corpuscule/custom-builtin-elements

[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/custom-builtin-elements.svg)](https://www.npmjs.com/package/@corpuscule/custom-builtin-elements)
[![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/custom-builtin-elements)](https://bundlephobia.com/result?p=@corpuscule/custom-builtin-elements)
[![Build Status](https://travis-ci.com/corpusculejs/custom-builtin-elements.svg?branch=master)](https://travis-ci.com/corpusculejs/custom-builtin-elements)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Test Coverage](https://codecov.io/gh/corpusculejs/custom-builtin-elements/branch/master/graph/badge.svg)](https://codecov.io/gh/corpusculejs/custom-builtin-elements)

This package is a polyfill for the [Customized Built-in Elements](https://html.spec.whatwg.org/multipage/custom-elements.html#customized-built-in-element)
specification.

## Rationale

Unfortunately, Safari [is not going](https://github.com/w3c/webcomponents/issues/509#issuecomment-222860736)
to support this part of the Custom Elements spec, as well as IE 11 and Edge do
not have this feature on board. This polyfill aims to fill this gap and provide
support for this feature for all browsers that miss it.

You may have a question: why choose this polyfill if there already is a
well-known and popular [`@ungap/custom-elements-builtin`](https://github.com/ungap/custom-elements-builtin)?
Unfortunately, it has some problems that make it hard to use. For example, with
the `@ungap/custom-elements-builtin` you cannot use class constructors or create new
elements with the `new` operator.

This polyfill provides the solution for all of these issues and makes it
possible to use the customized built-in elements in all browsers that lack
support for them: Safari, Edge, IE 11.

## Installation

npm:

```bash
$ npm install @corpuscule/custom-builtin-elements
```

Yarn:

```bash
$ yarn add @corpuscule/custom-builtin-elements
```

[https://unpkg.com](https://unpkg.com)

```javascript
import 'https://unpkg.com/@corpuscule/custom-builtin-elements';
```

## Support

To use this polyfill with IE 11 you need the following tools:

- `Symbol` polyfill (with support for `Symbol.hasInstance`).
- `WeakSet` polyfill.
- `Promise` polyfill.
- [@babel/plugin-transform-instanceof](https://www.npmjs.com/package/@babel/plugin-transform-instanceof)
  applied to your code that uses `instanceof` against any built-in constructor
  (like `HTMLButtonElement` etc.).

Also, for all browsers that do not support native web components, you need an
implementation of the `customElements` registry existing. You may use either the
[`@webcomponents/webcomponentsjs`](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs)
polyfill to have autonomous custom elements as well or the following stub that
would allow you to use only the customized built-in elements. Note that you have
to place the `customElements` implementation **before** this polyfill.

```javascript
function impl() {
  throw new Error('Not supported in this environment');
}

window.customElements = {
  define: impl,
  get: impl,
  upgrade: impl,
  whenDefined: impl,
};
```

## Example

```javascript
class ClickCounter extends HTMLButtonElement {
  constructor() {
    super();
    this._count = 0;
    this.increase = this.increase.bind(this);
  }

  get count() {
    return this._count;
  }

  connectedCallback() {
    this.addEventListener('click', this.increase);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.increase);
  }

  increase() {
    this._count += 1;
  }
}

customElements.define('x-click-counter', ClickCounter, {extends: 'button'});
```
