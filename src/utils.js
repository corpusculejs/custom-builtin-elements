import {elementsRegistry, getPrototypeOf, observerRegistry} from './shared';
import {disconnect, setupAndConnect} from './upgrade';

export const getPrototypeChain = proto => {
  const chain = [proto];
  let currentProto = proto;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    currentProto = getPrototypeOf(currentProto);

    if (currentProto === HTMLElement.prototype) {
      return chain;
    }

    chain.push(currentProto);
  }
};

export const isCheck = node => node.hasAttribute('is');

/**
 * This function runs callback for all nodes that meets the criteria provided by
 * the "check" function, in both "root" or its children shadow roots.
 *
 * @param {Node} root the node where the search is performed.
 * @param {function(node: Node): boolean} check the function that checks if the
 * node meets the criteria.
 * @param {function(node: Node): void} callback the callback to run.
 */
export const runForDescendants = (root, check, callback) => {
  const iter = document.createNodeIterator(
    root,
    NodeFilter.SHOW_ELEMENT,
    node => check(node) || node.shadowRoot,
    null,
    false,
  );

  let node;

  while ((node = iter.nextNode())) {
    if (node.shadowRoot) {
      runForDescendants(node.shadowRoot, check, callback);
    } else {
      callback(node);
    }
  }
};

export const recognizeElement = element => {
  const name = element.getAttribute('is');

  return name && elementsRegistry[name];
};

export const watchElementsChanges = mutations => {
  for (let i = 0, iLen = mutations.length; i < iLen; i++) {
    const {addedNodes, removedNodes} = mutations[i];
    for (let j = 0, jLen = addedNodes.length; j < jLen; j++) {
      runForDescendants(addedNodes[j], isCheck, setupAndConnect);

      // When our element is connected to the DOM, it is not necessary to
      // continue watching it: the parent element will do it for us. So we just
      // disconnect the element observer.
      observerRegistry.get(addedNodes[j])?.disconnect();
    }

    for (let j = 0, jLen = removedNodes.length; j < jLen; j++) {
      runForDescendants(removedNodes[j], isCheck, disconnect);

      // When our element is removed, we still can change it, so we need to
      // observe it again.
      observerRegistry.get(removedNodes[j])?.observe();
    }
  }
};

export const createElementObserver = element => {
  const observer = new MutationObserver(watchElementsChanges);
  const observingTool = {
    disconnect: () => observer.disconnect(),
    observe: () => observer.observe(element, {childList: true, subtree: true}),
  };
  observerRegistry.set(element, observingTool);
};
