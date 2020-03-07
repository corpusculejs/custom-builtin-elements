# @corpuscule/custom-builtin-elements

[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/custom-builtin-elements.svg)](https://www.npmjs.com/package/@corpuscule/custom-builtin-elements)
[![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/custom-builtin-elements)](https://bundlephobia.com/result?p=@corpuscule/custom-builtin-elements)
[![CI Status](https://github.com/corpusculejs/custom-builtin-elements/workflows/CI/badge.svg)](https://github.com/corpusculejs/custom-builtin-elements/actions)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=corpusculejs_custom-builtin-elements&metric=coverage)](https://sonarcloud.io/dashboard?id=corpusculejs_custom-builtin-elements)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=corpusculejs_custom-builtin-elements&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=corpusculejs_custom-builtin-elements)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=corpusculejs_custom-builtin-elements&metric=bugs)](https://sonarcloud.io/dashboard?id=corpusculejs_custom-builtin-elements)

This package is a polyfill for the [Customized Built-in Elements](https://html.spec.whatwg.org/multipage/custom-elements.html#customized-built-in-element)
specification.

## Rationale

Unfortunately, Safari [is not going](https://github.com/w3c/webcomponents/issues/509#issuecomment-222860736)
to support this part of the Custom Elements spec, as well as IE 11 and Edge do
not have this feature on board. This polyfill aims to fill this gap and provide
support for this feature for all browsers that miss it.

Differently from [@ungap/custom-elements-builtin](https://github.com/ungap/custom-elements-builtin), this polyfills allow the usage of the `constructor`, which is apparently a [caveat](https://github.com/ungap/custom-elements-builtin#constructor-caveat) of that alternative library.

This polyfill provides a solution that issue and makes it possible to use the customized built-in elements in all browsers that lack support for them: Safari, Edge, IE 11.

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
- `Promise` polyfill.
- [@babel/plugin-transform-instanceof](https://www.npmjs.com/package/@babel/plugin-transform-instanceof)
  applied to your code that uses `instanceof` against any built-in constructor
  (like `HTMLButtonElement` etc.).

Also, for all browsers that do not support native web components, you need an
implementation of the `customElements` registry existing. You have the following
choices:

- Use [`@webcomponents/webcomponentsjs`](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs),
  that will also add support for autonomous custom elements.
- Use the minimal implementation of `customElements` provided by this polyfill
  that would allow you to use the customized built-in elements only.

Note that both minimal implementation or `@webcomponents/webcomponentsjs`
polyfill should be executed **before** the main polyfill because it will
override methods of the `customElements` registry.

Examples of adding minimal implementation:

- via npm and ESM:

```javascript
import '@corpuscule/custom-builtin-elements/lib/customElementsBase';
import '@corpuscule/custom-builtin-elements';
```

- via [https://unpkg.com](https://unpkg.com) and `script`:

```html
<script src="https://unpkg.com/@corpuscule/custom-builtin-elements/lib/customElementsBase.js"></script>
<script src="https://unpkg.com/@corpuscule/custom-builtin-elements"></script>
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
