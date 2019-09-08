import {
  $connectedCallback,
  $disconnectedCallback,
  elementsRegistry,
  lifecycleRegistry,
  upgradedElementsRegistry,
  upgradingRegistry,
} from './shared';

export function recognizeElement(element) {
  const name = element.getAttribute('is');

  return name && elementsRegistry[name];
}

export function setup(element, constructor) {
  if (!upgradedElementsRegistry.has(element)) {
    upgradingRegistry.set(constructor, element);
    new constructor(); // eslint-disable-line no-new
    upgradedElementsRegistry.add(element);
  }
}

export function setupAndConnect(element) {
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
}

export function disconnect(element) {
  const constructor = recognizeElement(element);

  if (
    constructor &&
    $disconnectedCallback in element &&
    lifecycleRegistry.get(element) !== $disconnectedCallback
  ) {
    element[$disconnectedCallback]();
    lifecycleRegistry.set(element, $disconnectedCallback);
  }
}
