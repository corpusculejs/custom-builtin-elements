import {defineCBE, generateName} from './defineCBE';

describe('custom-builtin-elements-polyfill', () => {
  describe('registry', () => {
    it('throws an error if there is attempt to add two elements with the same name', () => {
      class A extends HTMLButtonElement {}
      const name = defineCBE(A, 'button');

      class B extends HTMLButtonElement {}

      expect(() =>
        customElements.define(name, B, {extends: 'button'}),
      ).toThrowError(
        `Failed to execute 'define' on 'CustomElementRegistry': the name "${name}" has already been used with this registry`,
      );
    });

    it('throws an error if there is attempt to add single element with two names', () => {
      class A extends HTMLButtonElement {}
      defineCBE(A, 'button');

      expect(() => defineCBE(A, 'button')).toThrowError(
        "Failed to execute 'define' on 'CustomElementRegistry': this constructor has already been used with this registry",
      );
    });

    it('throws an error if the element name does not have dash symbol', () => {
      class A extends HTMLButtonElement {}

      expect(() =>
        customElements.define('foo', A, {extends: 'button'}),
      ).toThrowError(
        "Failed to execute 'define' on 'CustomElementRegistry': \"foo\" is not a valid custom element name",
      );
    });

    it('gets constructor by name', () => {
      class A extends HTMLButtonElement {}
      const name = defineCBE(A, 'button');

      const constructor = customElements.get(name);
      expect(constructor).toBe(A);
    });

    it('upgrades the element', () => {
      const name = generateName();
      const div = document.createElement('div');
      div.innerHTML = `<button is="${name}"></button>`;

      // eslint-disable-next-line prefer-destructuring
      const buttonToUpgrade = div.children[0];

      class A extends HTMLButtonElement {}
      customElements.define(name, A, {extends: 'button'});

      expect(buttonToUpgrade instanceof A).not.toBeTruthy();

      customElements.upgrade(buttonToUpgrade);

      expect(buttonToUpgrade instanceof A).toBeTruthy();
    });

    it('waits until the component is defined', done => {
      class A extends HTMLButtonElement {}
      const name = defineCBE(A, 'button');

      customElements.whenDefined(name).then(done);
    });
  });
});
