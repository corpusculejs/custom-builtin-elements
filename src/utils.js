import {
  $connectedCallback,
  $disconnectedCallback,
  elementsRegistry,
  elementsReversedRegistry,
  lifecycleRegistry,
  supportsNativeWebComponents,
  upgradingRegistry,
} from './shared';

export const {
  defineProperties,
  defineProperty,
  getOwnPropertyDescriptor,
  getPrototypeOf,
  setPrototypeOf,
} = Object;

export function getPrototypeChain(proto) {
  const chain = [proto];
  let currentProto = proto;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    currentProto = getPrototypeOf(currentProto);

    if (
      currentProto === Object.prototype ||
      currentProto === HTMLElement.prototype
    ) {
      return chain;
    }

    chain.push(currentProto);
  }
}

export function isConnected(element) {
  return 'isConnected' in element
    ? element.isConnected
    : document.body.contains(element);
}

const checkShadow = (node, pierce) =>
  supportsNativeWebComponents && pierce && node.shadowRoot;

/**
 * This function runs callback for all nodes that meets the criteria provided by
 * the "check" function, in both "root" or its children shadow roots.
 *
 * @param {Node} root the node where the search is performed.
 * @param {function(node: Node): boolean} check the function that checks if the
 * node meets the criteria.
 * @param {function(node: Node): void} callback the callback to run.
 * @param {Boolean} pierce an option that describes if the shadow boundaries
 * should be pierced while iterating.
 */
export function runForDescendants(root, check, callback, pierce = false) {
  const iter = document.createNodeIterator(
    root,
    NodeFilter.SHOW_ELEMENT,
    node =>
      check(node) || checkShadow(node, pierce)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
    null,
    false,
  );

  let node;

  while ((node = iter.nextNode())) {
    if (checkShadow(node, pierce)) {
      runForDescendants(node.shadowRoot, check, callback, pierce);
    } else {
      callback(node);
    }
  }
}

export function recognizeElementByIsAttribute(element) {
  const name = element.getAttribute('is');

  return name && elementsRegistry[name];
}

export function recognizeElementByConstructor({constructor}) {
  return elementsReversedRegistry.has(constructor) && constructor;
}

export function setup(element) {
  const constructor = recognizeElementByIsAttribute(element);
  upgradingRegistry.set(constructor, element);
  new constructor(); // eslint-disable-line no-new
}

export function connect(element) {
  if (
    $connectedCallback in element &&
    lifecycleRegistry.get(element) !== $connectedCallback
  ) {
    element[$connectedCallback]();
    lifecycleRegistry.set(element, $connectedCallback);
  }
}

export function disconnect(element) {
  if (
    $disconnectedCallback in element &&
    lifecycleRegistry.get(element) !== $disconnectedCallback
  ) {
    element[$disconnectedCallback]();
    lifecycleRegistry.set(element, $disconnectedCallback);
  }
}

function watchDOMChanges(mutations) {
  for (let i = 0, iLen = mutations.length; i < iLen; i++) {
    const {addedNodes, removedNodes} = mutations[i];
    for (let j = 0, jLen = addedNodes.length; j < jLen; j++) {
      // We run connectedCallback only for elements that are connected to the
      // document DOM.
      if (isConnected(addedNodes[j])) {
        runForDescendants(
          addedNodes[j],
          recognizeElementByConstructor,
          connect,
          true,
        );
      }
    }

    for (let j = 0, jLen = removedNodes.length; j < jLen; j++) {
      runForDescendants(
        removedNodes[j],
        recognizeElementByConstructor,
        disconnect,
        true,
      );
    }
  }
}

export function createElementObserver(element) {
  const observer = new MutationObserver(watchDOMChanges);
  observer.observe(element, {childList: true, subtree: true});
}

// Export function isConnectedToObservingNode(element) {
//   if (isConnected(element)) {
//     return true;
//   }
//
//   let node = element;
//
//   while (node) {
//     if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
//       return true;
//     }
//
//     node = node.parentNode;
//   }
//
//   return false;
// }
