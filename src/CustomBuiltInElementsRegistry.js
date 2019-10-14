/**
 * Customized built-in elements registry. Contains both "name => constructor"
 * and "constructor => name" associations.
 */
export class CustomBuiltInElementsRegistry {
  listeners = {};
  registry = {};
  reversed = new WeakMap();

  /**
   * Gets the constructor if the name received or the name if constructor
   * received, respectively.
   *
   * @param {string|Function} nameOrConstructor a name or a constructor
   *
   * @returns {Function|string} a constructor or a name depending on the
   * `nameOrConstructor` value type.
   */
  get(nameOrConstructor) {
    return typeof nameOrConstructor === 'string'
      ? this.registry[nameOrConstructor]
      : this.reversed.get(nameOrConstructor);
  }

  /**
   * Checks the existence of the name/constructor in the registry.
   *
   * @param {string|Function} nameOrConstructor a name or a constructor of
   * customized built-in element to check.
   *
   * @returns {boolean} a result of the check.
   */
  has(nameOrConstructor) {
    return typeof nameOrConstructor === 'string'
      ? !!this.registry[nameOrConstructor]
      : this.reversed.has(nameOrConstructor);
  }

  /**
   * Associates a name of the customized built-in element with its constructor.
   *
   * @param {string} name a new name of the customized built-in element.
   * @param {Function} constructor a constructor of the customized built-in
   * element.
   */
  set(name, constructor) {
    const {listeners, registry, reversed} = this;

    registry[name] = constructor;
    reversed.set(constructor, name);

    if (listeners[name]) {
      for (let i = 0, len = listeners[name].length; i < len; i++) {
        listeners[name][i]();
      }
      listeners[name] = null;
    }
  }

  /**
   * Gets a promise that resolves when the customized built-in element with the
   * provided name is defined.
   *
   * @param {string} name a name of customized built-in element to be defined.
   * @returns {Promise<undefined>} a promise that resolves when the element is
   * defined.
   */
  whenDefined(name) {
    return new Promise(resolve => {
      const {listeners, registry} = this;

      if (registry[name]) {
        resolve();
      } else if (listeners[name]) {
        listeners[name].push(resolve);
      } else {
        listeners[name] = [resolve];
      }
    });
  }
}
