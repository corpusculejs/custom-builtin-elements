import {defineCBE} from './defineCBE';

describe('custom-builtin-elements-polyfill', () => {
  describe('creation', () => {
    it('allows to create custom built-in element via "new" operator', () => {
      class Foo extends HTMLAnchorElement {}
      defineCBE(Foo, 'a');

      const foo = new Foo();
      expect(foo instanceof Foo).toBeTruthy();
      expect(foo instanceof HTMLAnchorElement).toBeTruthy();
    });

    it('allows to create custom built-in element via "document.createElement"', () => {
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

    it('throws an error if it is not in the registry during creation', () => {
      class Foo extends HTMLAnchorElement {}

      expect(() => new Foo()).toThrowError('Illegal constructor');
    });
  });
});
