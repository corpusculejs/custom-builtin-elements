/* eslint-disable class-methods-use-this */
import {stringFixture as fixture} from '@open-wc/testing-helpers/src/stringFixture';
import {defineCE} from '@open-wc/testing-helpers/src/helpers';
import {defineCBE, generateName} from './helpers';

const waitForMutationObserverChange = async (elementToObserve, options) => {
  return new Promise((resolve, reject) => {
    try {
      let observer;

      const cb = () => {
        observer.disconnect();
        resolve();
      };

      observer = new MutationObserver(cb);
      observer.observe(elementToObserve, options);
    } catch (e) {
      reject(e);
    }
  });
};

const observeChildren = {childList: true, subtree: true};
const observeAttributes = {attributes: true};

const hasNativeCustomElementRegistry = 'CustomElementRegistry' in window;

describe('custom-builtin-elements-polyfill', () => {
  describe('constructor', () => {
    it('allows to create element via "new" operator', () => {
      class Foo extends HTMLAnchorElement {}
      defineCBE(Foo, 'a');

      const foo = new Foo();
      expect(foo instanceof Foo).toBeTruthy();
      expect(foo instanceof HTMLAnchorElement).toBeTruthy();
    });

    it('allows to create element via "document.createElement"', () => {
      class Foo extends HTMLAnchorElement {}
      const name = defineCBE(Foo, 'a');

      const foo = document.createElement('a', {is: name});
      expect(foo instanceof Foo).toBeTruthy();
      expect(foo instanceof HTMLAnchorElement).toBeTruthy();
    });

    it('applies user-defined constructor and prototype to a created element', () => {
      class Foo extends HTMLAnchorElement {
        constructor() {
          super();
          this.bar = 'test-string';
        }

        baz() {
          return this.bar;
        }
      }

      const name = defineCBE(Foo, 'a');

      const foo1 = new Foo();
      const foo2 = document.createElement('a', {is: name});

      expect(foo1.bar).toBe('test-string');
      expect(foo1.baz()).toBe('test-string');

      expect(foo2.bar).toBe('test-string');
      expect(foo2.baz()).toBe('test-string');
    });

    it('works with the multiple descendants', () => {
      class Foo extends HTMLButtonElement {}
      class Bar extends Foo {}
      class Baz extends Foo {}

      defineCBE(Bar, 'button');
      defineCBE(Baz, 'button');

      const bar = new Bar();
      const baz = new Baz();

      expect(bar instanceof Bar).toBeTruthy();
      expect(bar instanceof Foo).toBeTruthy();
      expect(bar instanceof HTMLButtonElement).toBeTruthy();

      expect(baz instanceof Baz).toBeTruthy();
      expect(baz instanceof Foo).toBeTruthy();
      expect(baz instanceof HTMLButtonElement).toBeTruthy();
    });

    it('throws an error if it is not in the registry during creation', () => {
      class Foo extends HTMLAnchorElement {}

      expect(() => new Foo()).toThrowError('Illegal constructor');
    });
  });

  describe('CustomElementRegistry', () => {
    describe('define', () => {
      it('upgrades elements that exist on the page before declaration', async () => {
        const name = generateName();
        await fixture(
          `<div><button is="${name}"></button></div>` +
            `<div><div><div><button is="${name}"></button></div></div></div>`,
        );

        const elements = document.querySelectorAll(`[is=${name}]`);

        class Foo extends HTMLButtonElement {}
        defineCBE(Foo, 'button', name);

        for (let i = 0, len = elements.length; i < len; i++) {
          expect(elements[i] instanceof Foo).toBeTruthy();
          elements[i].parentNode.removeChild(elements[i]);
        }
      });

      it('throws an error if there is attempt to add two elements with the same name', () => {
        class Foo extends HTMLButtonElement {}
        const name = defineCBE(Foo, 'button');

        class Bar extends HTMLButtonElement {}

        expect(() => defineCBE(Bar, 'button', name)).toThrowError(
          `Failed to execute 'define' on 'CustomElementRegistry': the name "${name}" has already been used with this registry`,
        );
      });

      it('throws an error if there is attempt to add single element with two names', () => {
        class Foo extends HTMLButtonElement {}
        defineCBE(Foo, 'button');

        expect(() => defineCBE(Foo, 'button')).toThrowError(
          "Failed to execute 'define' on 'CustomElementRegistry': this constructor has already been used with this registry",
        );
      });

      it('throws an error if the element name does not have dash symbol', () => {
        class Foo extends HTMLButtonElement {}

        expect(() => defineCBE(Foo, 'button', 'foo')).toThrowError(
          "Failed to execute 'define' on 'CustomElementRegistry': \"foo\" is not a valid custom element name",
        );
      });

      it('uses the native method if no options provided', () => {
        if (hasNativeCustomElementRegistry) {
          pending();
        }

        class Foo {}
        expect(() => defineCE(Foo)).toThrowError(
          'Not supported in this environment',
        );
      });
    });

    describe('get', () => {
      it('gets constructor by name', () => {
        class Foo extends HTMLButtonElement {}
        const name = defineCBE(Foo, 'button');

        const constructor = customElements.get(name);
        expect(constructor).toBe(Foo);
      });

      it('runs native method if if the element is not recognized', () => {
        if (hasNativeCustomElementRegistry) {
          pending();
        }

        expect(() => customElements.get('x-foo')).toThrowError(
          'Not supported in this environment',
        );
      });
    });

    describe('upgrade', () => {
      it('upgrades the element', () => {
        const name = generateName();
        const div = document.createElement('div');
        div.innerHTML = `<button is="${name}"></button>`;

        // eslint-disable-next-line prefer-destructuring
        const buttonToUpgrade = div.children[0];

        class Foo extends HTMLButtonElement {}
        customElements.define(name, Foo, {extends: 'button'});

        expect(buttonToUpgrade instanceof Foo).not.toBeTruthy();

        customElements.upgrade(buttonToUpgrade);

        expect(buttonToUpgrade instanceof Foo).toBeTruthy();
      });

      it('uses the native method if the element is not recognized', () => {
        if (hasNativeCustomElementRegistry) {
          pending();
        }

        const foo = document.createElement('x-foo');
        expect(() => customElements.upgrade(foo)).toThrowError(
          'Not supported in this environment',
        );
      });
    });

    describe('whenDefined', () => {
      it('waits until the component is defined', done => {
        class Foo extends HTMLButtonElement {}
        const name = defineCBE(Foo, 'button');

        customElements.whenDefined(name).then(done);
      });

      it('uses the native method if the element is not recognized', () => {
        if (hasNativeCustomElementRegistry) {
          pending();
        }

        expect(() => customElements.whenDefined('x-foo')).toThrowError(
          'Not supported in this environment',
        );
      });
    });
  });

  describe('lifecycle', () => {
    describe('attributeChangedCallback', () => {
      let attributeChangedCallbackSpy;

      beforeEach(() => {
        attributeChangedCallbackSpy = jasmine.createSpy(
          'attributeChangedCallback',
        );
      });

      it('runs callback for attribute changes of the detached element', async () => {
        class Foo extends HTMLAnchorElement {
          static get observedAttributes() {
            return ['bar'];
          }

          attributeChangedCallback(name, oldValue, newValue) {
            attributeChangedCallbackSpy(name, oldValue, newValue);
          }
        }

        defineCBE(Foo, 'a');
        const foo = new Foo();

        const promise = waitForMutationObserverChange(foo, observeAttributes);
        foo.setAttribute('bar', '12');

        await promise;

        expect(attributeChangedCallbackSpy).toHaveBeenCalledWith(
          'bar',
          null,
          '12',
        );
      });
    });

    describe('connectedCallback', () => {
      let connectedCallbackSpy;

      beforeEach(() => {
        connectedCallbackSpy = jasmine.createSpy('connectedCallback');
      });

      it('calls the callback for elements already existing on declaration', async () => {
        const name = generateName();

        await fixture(
          `<div><a is="${name}"></a></div>` +
            `<div><div><div><a is="${name}"></a></a></div></div></div>`,
        );

        class Foo extends HTMLAnchorElement {
          connectedCallback() {
            connectedCallbackSpy();
          }
        }

        defineCBE(Foo, 'a', name);

        expect(connectedCallbackSpy).toHaveBeenCalledTimes(2);
      });

      it('calls the callback when the element is attached to the body', async () => {
        class Foo extends HTMLAnchorElement {
          connectedCallback() {
            connectedCallbackSpy();
          }
        }

        defineCBE(Foo, 'a');

        const foo = new Foo();

        const wrapper = await fixture('<div></div>');

        const promise = waitForMutationObserverChange(
          document.body,
          observeChildren,
        );

        wrapper.appendChild(foo);

        await promise;

        expect(connectedCallbackSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('disconnectedCallback', () => {
      let disconnectedCallbackSpy;

      beforeEach(() => {
        disconnectedCallbackSpy = jasmine.createSpy('disconnectedCallback');
      });

      it('calls the callback when the element is detached from the DOM', async () => {
        class Foo extends HTMLAnchorElement {
          disconnectedCallback() {
            disconnectedCallbackSpy();
          }
        }

        defineCBE(Foo, 'a');
        const foo = new Foo();

        const wrapper = await fixture('<div></div>');
        wrapper.appendChild(foo);

        const promise = waitForMutationObserverChange(
          document.body,
          observeChildren,
        );
        foo.parentNode.removeChild(foo);

        await promise;

        expect(disconnectedCallbackSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('customElements', () => {
    let connectedCallbackSpy;
    let disconnectedCallbackSpy;

    beforeEach(() => {
      // We don't support web components in Edge or IE
      if (!('ShadowRoot' in window)) {
        pending();
      }

      connectedCallbackSpy = jasmine.createSpy('connectedCallback');
      disconnectedCallbackSpy = jasmine.createSpy('disconnectedCallback');
    });

    it('upgrades element in the attached custom element on definition and runs connectedCallback', async () => {
      const name = generateName();

      class Foo extends HTMLElement {
        constructor() {
          super();
          const root = this.attachShadow({mode: 'open'});
          root.innerHTML =
            `<a is="${name}"></a><div>` +
            `<div><a is="${name}"></a></div></div>`;
        }
      }

      const tag = defineCE(Foo);
      const foo = await fixture(`<${tag}></${tag}>`);

      class Bar extends HTMLAnchorElement {
        connectedCallback() {
          connectedCallbackSpy();
        }
      }
      defineCBE(Bar, 'a', name);

      expect(foo.shadowRoot.children[0] instanceof Bar);
      expect(connectedCallbackSpy).toHaveBeenCalledTimes(2);
    });

    it('does nothing if custom element is detached and declaration is later than element creation', () => {
      const name = generateName();

      class Foo extends HTMLElement {
        constructor() {
          super();
          const root = this.attachShadow({mode: 'open'});
          root.innerHTML =
            `<a is="${name}"></a><div>` +
            `<div><a is="${name}"></a></div></div>`;
        }
      }

      defineCE(Foo);
      const foo = new Foo();

      class Bar extends HTMLAnchorElement {
        connectedCallback() {
          connectedCallbackSpy();
        }
      }

      defineCBE(Bar, 'a', name);

      expect(foo.shadowRoot.children[0] instanceof Bar).not.toBeTruthy();
      expect(connectedCallbackSpy).not.toHaveBeenCalled();
    });

    it('upgrades element in detached custom element if declaration goes before custom element creation', () => {
      class Bar extends HTMLAnchorElement {
        connectedCallback() {
          connectedCallbackSpy();
        }
      }

      const name = defineCBE(Bar, 'a');

      class Foo extends HTMLElement {
        constructor() {
          super();
          const root = this.attachShadow({mode: 'open'});
          root.innerHTML =
            `<a is="${name}"></a><div>` +
            `<div><a is="${name}"></a></div></div>`;
        }
      }

      defineCE(Foo);
      const foo = new Foo();

      expect(foo.shadowRoot.children[0] instanceof Bar).toBeTruthy();
      expect(connectedCallbackSpy).not.toHaveBeenCalled();
    });

    it('calls connectedCallback for elements appended to a custom element that is already attached', async () => {
      class Foo extends HTMLElement {
        constructor() {
          super();
          const root = this.attachShadow({mode: 'open'});
          root.innerHTML = `<a is="${name}"></a>`;
        }
      }

      const tag = defineCE(Foo);
      const foo = await fixture(`<${tag}></${tag}>`);

      class Bar extends HTMLButtonElement {
        connectedCallback() {
          connectedCallbackSpy();
        }
      }
      defineCBE(Bar, 'button');

      const bar = new Bar();

      const promise = waitForMutationObserverChange(
        foo.shadowRoot,
        observeChildren,
      );

      foo.shadowRoot.appendChild(bar);

      await promise;

      expect(connectedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('calls disconnectedCallback for elements removed from attached custom element', async () => {
      class Bar extends HTMLAnchorElement {
        disconnectedCallback() {
          disconnectedCallbackSpy();
        }
      }
      const name = defineCBE(Bar, 'a');

      class Foo extends HTMLElement {
        constructor() {
          super();
          const root = this.attachShadow({mode: 'open'});
          root.innerHTML = `<a is=${name}></a>`;
        }
      }

      const tag = defineCE(Foo);
      const foo = await fixture(`<${tag}></${tag}>`);

      // eslint-disable-next-line prefer-destructuring
      const bar = foo.shadowRoot.children[0];

      const promise = waitForMutationObserverChange(
        foo.shadowRoot,
        observeChildren,
      );
      bar.parentNode.removeChild(bar);

      await promise;

      expect(disconnectedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('calls disconnectedCallback for elements inside shadow root of removed element', async () => {
      class Bar extends HTMLAnchorElement {
        disconnectedCallback() {
          disconnectedCallbackSpy();
        }
      }
      const name = defineCBE(Bar, 'a');

      class Foo extends HTMLElement {
        constructor() {
          super();
          const root = this.attachShadow({mode: 'open'});
          root.innerHTML = `<a is=${name}></a>`;
        }
      }

      const tag = defineCE(Foo);
      const foo = await fixture(`<${tag}></${tag}>`);

      const promise = waitForMutationObserverChange(
        document.body,
        observeChildren,
      );

      foo.parentNode.removeChild(foo);

      await promise;

      expect(disconnectedCallbackSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('insertion methods', () => {
    it('upgrades elements inserted via innerHTML to detached elements', () => {
      class Foo extends HTMLAnchorElement {}
      const name = defineCBE(Foo, 'a');

      const wrapper = document.createElement('div');
      wrapper.innerHTML = `<a is=${name}></a>`;

      expect(wrapper.children[0] instanceof Foo).toBeTruthy();
    });

    it('upgrades elements inserted via insertAdjacentHTML to detached element', () => {
      class Foo extends HTMLAnchorElement {}
      const name = defineCBE(Foo, 'a');

      const wrapper = document.createElement('div');
      wrapper.insertAdjacentHTML('beforeend', `<a is=${name}></a>`);

      expect(wrapper.children[0] instanceof Foo).toBeTruthy();
    });

    it('upgrades elements inserted via cloneNode to detached element', () => {
      const name = generateName();

      const nodeToClone = document.createElement('div');
      nodeToClone.innerHTML = `<a is="${name}"></a>`;

      class Foo extends HTMLAnchorElement {}
      defineCBE(Foo, 'a', name);

      const wrapper = nodeToClone.cloneNode(true);
      expect(wrapper.children[0] instanceof Foo).toBeTruthy();
    });

    it('upgrades elements inserted via importNode to detached element', async () => {
      const name = generateName();

      const iframe = await fixture('<iframe></iframe>');
      const foreignDocument = iframe.contentWindow.document;
      foreignDocument.body.innerHTML = `<div><a is="${name}"></a></div>`;

      // eslint-disable-next-line prefer-destructuring
      const nodeToImport = foreignDocument.body.children[0];

      class Foo extends HTMLAnchorElement {}
      defineCBE(Foo, 'a', name);

      const wrapper = document.importNode(nodeToImport, true);
      expect(wrapper.children[0] instanceof Foo).toBeTruthy();
    });
  });
});
