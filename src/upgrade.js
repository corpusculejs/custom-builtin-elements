import {
  $connectedCallback,
  $disconnectedCallback,
  lifecycleRegistry,
  upgradedElementsRegistry,
  upgradingRegistry,
} from './shared';
import {recognizeElement} from './utils';

export const setup = (element, constructor) => {
  if (!upgradedElementsRegistry.has(element)) {
    upgradingRegistry.set(constructor, element);
    new constructor(); // eslint-disable-line no-new
    upgradedElementsRegistry.add(element);
  }
};

export const setupAndConnect = element => {
  const constructor = recognizeElement(element);

  if (constructor) {
    setup(element, constructor);

    if (
      element.isConnected &&
      $connectedCallback in element &&
      lifecycleRegistry.get(element) !== $connectedCallback
    ) {
      element[$connectedCallback]();
      lifecycleRegistry.set(element, $connectedCallback);
    }
  }
};

export const disconnect = element => {
  const constructor = recognizeElement(element);

  if (
    constructor &&
    $disconnectedCallback in element &&
    lifecycleRegistry.get(element) !== $disconnectedCallback
  ) {
    element[$disconnectedCallback]();
    lifecycleRegistry.set(element, $disconnectedCallback);
  }
};
