import {elementsRegistry} from './shared';
import {setupAndConnect} from './upgrade';
import {createElementObserver, isCheck, runForDescendants} from './utils';

function wrap(proto, name) {
  const nativeMethod = proto[name];

  proto[name] = function() {
    const result = nativeMethod.apply(this, arguments);

    if (
      result.nodeType === Node.ELEMENT_NODE ||
      result.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
      const body = result.content || result;

      runForDescendants(body, isCheck, setupAndConnect);
      createElementObserver(body);
    }
  };
}

function patchNativeMethods() {
  const {createElement} = document;
  document.createElement = function(_, options) {
    let element;

    if (options && options.is) {
      const constructor = elementsRegistry[options.is];

      if (constructor) {
        element = new constructor();
      }
    } else {
      element = createElement.apply(document, arguments);
    }

    // We need to upgrade non-connected elements and their internal tree, so
    // we add the MutationObserver to perform it.
    createElementObserver(element.content || element);

    return element;
  };

  wrap(Document.prototype, 'importNode');
  wrap(Node.prototype, 'cloneNode');
}

export default patchNativeMethods;
