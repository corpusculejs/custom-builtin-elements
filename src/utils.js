import {supportsNativeWebComponents} from './shared';
import {disconnect, setupAndConnect} from './upgrade';

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

    if (currentProto === Object.prototype) {
      return chain;
    }

    chain.push(currentProto);
  }
}

export function isCheck(node) {
  return node.hasAttribute('is');
}

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
      check(node) || (pierce && supportsNativeWebComponents && node.shadowRoot),
    null,
    false,
  );

  let node;

  while ((node = iter.nextNode())) {
    if (supportsNativeWebComponents && pierce && node.shadowRoot) {
      runForDescendants(node.shadowRoot, check, callback, pierce);
    } else {
      callback(node);
    }
  }
}

function watchDOMChanges(mutations) {
  for (let i = 0, iLen = mutations.length; i < iLen; i++) {
    const {addedNodes, removedNodes} = mutations[i];
    for (let j = 0, jLen = addedNodes.length; j < jLen; j++) {
      runForDescendants(addedNodes[j], isCheck, setupAndConnect, true);
    }

    for (let j = 0, jLen = removedNodes.length; j < jLen; j++) {
      runForDescendants(removedNodes[j], isCheck, disconnect, true);
    }
  }
}

export function createElementObserver(element) {
  const observer = new MutationObserver(watchDOMChanges);
  observer.observe(element, {childList: true, subtree: true});
}

export function isConnected(element) {
  return 'isConnected' in element
    ? element.isConnected
    : document.body.contains(element);
}

export function isConnectedToObservingNode(element) {
  if (isConnected(element)) {
    return true;
  }

  let node = element;

  while (node) {
    if (node.parentNode.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return true;
    }

    node = node.parentNode;
  }

  return false;
}
