import {
  elementsRegistry,
  elementsReversedRegistry,
  nativeConstructorRegistry,
  patchedPrototypesRegistry,
} from './shared';
import {recognizeElement, setup, setupAndConnect} from './upgrade';
import {
  defineProperties,
  getPrototypeChain,
  runForDescendants,
  setPrototypeOf,
} from './utils';

const CERExceptionCommonText =
  "Failed to execute 'define' on 'CustomElementRegistry'";

const dashPattern = /-/;

function patchCustomElementsRegistry() {
  const {define, get, upgrade, whenDefined} = customElements;

  defineProperties(customElements, {
    define: {
      configurable: true,
      value(name, constructor, options) {
        if (!options || !options.extends) {
          define.apply(customElements, arguments);

          return;
        }

        if (name in elementsRegistry) {
          throw new Error(
            `${CERExceptionCommonText}: the name "${name}" has already been used with this registry`,
          );
        }

        if (elementsReversedRegistry.has(constructor)) {
          throw new Error(
            `${CERExceptionCommonText}: this constructor has already been used with this registry`,
          );
        }

        if (!dashPattern.test(name)) {
          throw new Error(
            `${CERExceptionCommonText}: "${name}" is not a valid custom element name`,
          );
        }

        const chain = getPrototypeChain(constructor.prototype);
        const polyfilledPrototype = chain[chain.length - 1];
        const firstChild = chain[chain.length - 2];

        const nativeConstructor = nativeConstructorRegistry.get(
          polyfilledPrototype.constructor,
        );

        if (!patchedPrototypesRegistry.has(firstChild)) {
          setPrototypeOf(firstChild, nativeConstructor.prototype);
          patchedPrototypesRegistry.add(firstChild);
        }

        elementsRegistry[name] = constructor;
        elementsReversedRegistry.set(constructor, name);

        const pattern = new RegExp(options.extends, 'i');

        runForDescendants(
          document,
          node =>
            pattern.test(node.tagName) && node.getAttribute('is') === name,
          setupAndConnect,
        );
      },
    },
    get: {
      configurable: true,
      value(name) {
        return elementsRegistry[name] || get.call(customElements, name);
      },
    },
    upgrade: {
      configurable: true,
      value(element) {
        const constructor = recognizeElement(element);

        if (constructor) {
          setup(element, constructor);
        } else {
          upgrade.call(customElements, element);
        }
      },
    },
    whenDefined: {
      configurable: true,
      value(name) {
        return name in elementsRegistry
          ? Promise.resolve()
          : whenDefined.call(customElements, name);
      },
    },
  });
}

export default patchCustomElementsRegistry;
