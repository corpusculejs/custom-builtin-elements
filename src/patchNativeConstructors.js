/* eslint-disable no-prototype-builtins */
import {
  $attributeChangedCallback,
  elementsRegistry,
  nativeConstructorNames,
  nativeConstructorRegistry,
  tagsRegistry,
  upgradingRegistry,
} from './shared';
import {defineProperty, setPrototypeOf} from './utils';

function attributeChanged(mutations) {
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
}

function patchNativeConstructors() {
  nativeConstructorNames.forEach(nativeNamePart => {
    const nativeConstructorName = `HTML${nativeNamePart}Element`;
    const NativeConstructor = window[nativeConstructorName];

    class PolyfilledConstructor {
      constructor() {
        const {constructor} = this;

        if (!elementsRegistry.has(constructor)) {
          throw new TypeError('Illegal constructor');
        }

        let element;

        if (upgradingRegistry.has(constructor)) {
          // Upgrade mode. The already existing element will be upgraded to
          // customized built-in element.

          element = upgradingRegistry.get(constructor);
          upgradingRegistry.delete(constructor);
        } else {
          // Creation mode. The new element will be created.

          const tag = tagsRegistry.get(constructor);
          element = document.createElement(tag);
        }

        setPrototypeOf(element, constructor.prototype);
        element.constructor = constructor;

        const {observedAttributes} = constructor;

        if (observedAttributes && observedAttributes.length > 0) {
          const observer = new MutationObserver(attributeChanged);
          observer.observe(element, {
            attributeFilter: observedAttributes,
            attributeOldValue: true,
            attributes: true,
          });
        }

        // After return it will be set as "this" to the user-defined
        // constructor after the "super" call.
        return element;
      }
    }

    defineProperty(PolyfilledConstructor, Symbol.hasInstance, {
      configurable: true,
      value(instance) {
        return this === PolyfilledConstructor
          ? NativeConstructor.prototype.isPrototypeOf(instance)
          : this.prototype.isPrototypeOf(instance);
      },
    });

    nativeConstructorRegistry.set(PolyfilledConstructor, NativeConstructor);

    window[nativeConstructorName] = PolyfilledConstructor;
  });
}

export default patchNativeConstructors;
