import {
  elementsRegistry,
  isPattern,
  supportsNativeWebComponents,
} from './shared';
import {
  createElementObserver,
  defineProperty,
  getOwnPropertyDescriptor,
  isCheck,
  isConnectedToObservingNode,
  runForDescendants,
  setup,
} from './utils';

function patch(proto, name) {
  const nativeMethod = proto[name];

  proto[name] = function() {
    const result = nativeMethod.apply(this, arguments);

    if (
      result.nodeType === Node.ELEMENT_NODE ||
      result.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
      runForDescendants(result.content || result, isCheck, setup);
    }
  };
}

function patchNativeMethods() {
  const {createElement} = document;
  document.createElement = function(_, options) {
    if (options && options.is && elementsRegistry[options.is]) {
      return new elementsRegistry[options.is]();
    }

    return createElement.apply(document, arguments);
  };

  if (supportsNativeWebComponents) {
    const {attachShadow} = HTMLElement.prototype;
    HTMLElement.prototype.attachShadow = function() {
      const root = attachShadow.apply(this, arguments);
      createElementObserver(root);

      return root;
    };
  }

  patch(Document.prototype, 'importNode');
  patch(Node.prototype, 'cloneNode');

  const {insertAdjacentHTML} = Element.prototype;
  HTMLElement.prototype.insertAdjacentHTML = function(_, html) {
    insertAdjacentHTML.apply(this, arguments);

    if (isPattern.test(html) && !isConnectedToObservingNode(this)) {
      runForDescendants(this, isCheck, setup);
    }
  };

  const {get, set} = getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'innerHTML',
  );
  defineProperty(Element.prototype, 'innerHTML', {
    configurable: true,
    get,
    set(html) {
      set.call(this, html);

      if (isPattern.test(html) && !isConnectedToObservingNode(this)) {
        runForDescendants(this, isCheck, setup);
      }
    },
  });
}

export default patchNativeMethods;
