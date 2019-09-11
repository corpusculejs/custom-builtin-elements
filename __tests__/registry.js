import {defineCE} from '@open-wc/testing-helpers/src/helpers';
import {defineCBE, generateName} from './defineCBE';

const isPolyfill = HTMLButtonElement.name !== 'HTMLButtonElement';

describe('custom-builtin-elements-polyfill', () => {
  describe('CustomElementsRegistry', () => {
    describe('define', () => {
      it('throws an error if there is attempt to add two elements with the same name', () => {
        class Foo extends HTMLButtonElement {}
        const name = defineCBE(Foo, 'button');

        class Bar extends HTMLButtonElement {}

        expect(() =>
          customElements.define(name, Bar, {extends: 'button'}),
        ).toThrowError(
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

        expect(() =>
          customElements.define('foo', Foo, {extends: 'button'}),
        ).toThrowError(
          "Failed to execute 'define' on 'CustomElementRegistry': \"foo\" is not a valid custom element name",
        );
      });

      it('uses the native method if no options provided', () => {
        if (!isPolyfill) {
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
        if (!isPolyfill) {
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
        if (!isPolyfill) {
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
        if (!isPolyfill) {
          pending();
        }

        expect(() => customElements.whenDefined('x-foo')).toThrowError(
          'Not supported in this environment',
        );
      });
    });
  });
});
