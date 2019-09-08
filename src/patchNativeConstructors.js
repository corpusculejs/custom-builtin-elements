import {
  $attributeChangedCallback,
  elementsReversedRegistry,
  nativeConstructorNames,
  nativeConstructorRegistry,
  setPrototypeOf,
  tagsRegistry,
  upgradingRegistry,
} from './shared';

const attributeChanged = mutations => {
  for (let i = 0, len = mutations.length; i < len; i++) {
    const {attributeName, oldValue, target} = mutations[i];

    if (target[$attributeChangedCallback]) {
      target[$attributeChangedCallback](
        attributeName,
        oldValue,
        target.getAttribute(attributeName),
      );
    }
  }
};

const patchNativeConstructors = () => {
  for (let i = 0, len = nativeConstructorNames.length; i < len; i++) {
    const NativeConstructor = window[nativeConstructorNames[i]];

    class PolyfilledConstructor {
      static [Symbol.hasInstance](instance) {
        return instance instanceof NativeConstructor;
      }

      constructor() {
        const {constructor} = this;

        if (!elementsReversedRegistry.has(constructor)) {
          throw new TypeError('Illegal constructor');
        }

        let element;

        if (upgradingRegistry.has(constructor)) {
          // Upgrade mode. The already existing element will be upgraded to
          // customized built-in element.

          element = upgradingRegistry.get(constructor);
          upgradingRegistry.remove(constructor);
        } else {
          // Creation mode. The new element will be created.

          const tag = tagsRegistry.get(constructor);
          element = document.createElement(tag);
        }

        setPrototypeOf(element, constructor.prototype);
        element.constructor = constructor;

        if (
          element.observedAttributes &&
          element.observedAttributes.length > 0
        ) {
          const observer = new MutationObserver(attributeChanged);
          observer.observe(element, {
            attributeFilter: element.observedAttributes,
            attributeOldValue: true,
            attributes: true,
          });
        }

        // After return it will be set as "this" to the user-defined
        // constructor after the "super" call.
        return element;
      }
    }

    nativeConstructorRegistry.set(PolyfilledConstructor, NativeConstructor);

    window[nativeConstructorNames[i]] = PolyfilledConstructor;
  }
};

export default patchNativeConstructors;
