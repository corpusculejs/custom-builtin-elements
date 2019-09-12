# @corpuscule/custom-builtin-elements

This package is a polyfill for the [Customized Built-in Elements](https://html.spec.whatwg.org/multipage/custom-elements.html#customized-built-in-element)
specification.

## Rationale

Unfortunately, Safari [is not going](https://github.com/w3c/webcomponents/issues/509#issuecomment-222860736)
to support this part of the Custom Elements spec, as well as IE 11 and Edge do
not have this feature on board. This polyfill aims to fill this gap and provide
support for this feature for all browsers that miss it.

You may have a question: why choose this polyfill if there already is a
well-known and popular [`@ungap/built-in-elements`](https://github.com/ungap/custom-elements-builtin)?
Unfortunately, it has some caveats that make it hard to use. For example, with
the `@ungap/built-in-elements` you cannot use class constructors or create new
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
import "https://unpkg.com/@corpuscule/custom-builtin-elements";
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
    this.addEventListener('click', this.increase)
  }
  
  disconnectedCallback() {
    this.removeEventListener('click', this.increase)
  }
  
  increase() {
    this._count += 1;
  }
}

customElements.define('x-click-counter', ClickCounter, {extends: 'button'});
```
