import {
  elementsRegistry,
  isPattern,
  supportsNativeWebComponents,
} from './shared';
import {
  createElementObserver,
  defineProperty,
  getOwnPropertyDescriptor,
  recognizeElementByIsAttribute,
  runForDescendants,
  setup,
} from './utils';

function patchPickingMethod(proto, name) {
  const nativeMethod = proto[name];

  proto[name] = function() {
    const result = nativeMethod.apply(this, arguments);

    if (
      result.nodeType === Node.ELEMENT_NODE ||
      result.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
      runForDescendants(
        result.content || result,
        recognizeElementByIsAttribute,
        setup,
      );
    }

    return result;
  };
}

function patchInnerHTML(proto) {
  const {get, set} = getOwnPropertyDescriptor(proto, 'innerHTML');
  defineProperty(proto, 'innerHTML', {
    configurable: true,
    get,
    set(html) {
      set.call(this, html);

      if (isPattern.test(html)) {
        runForDescendants(this, recognizeElementByIsAttribute, setup);
      }
    },
  });
}

function patchNativeMethods() {
  const {createElement} = document;
  document.createElement = function(_, options) {
    if (options && options.is && elementsRegistry.has(options.is)) {
      return new (elementsRegistry.get(options.is))();
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

  patchPickingMethod(Document.prototype, 'importNode');
  patchPickingMethod(Node.prototype, 'cloneNode');

  const elementPrototype =
    'innerHTML' in Element.prototype
      ? Element.prototype
      : HTMLElement.prototype;

  const {insertAdjacentHTML} = elementPrototype;
  elementPrototype.insertAdjacentHTML = function(_, html) {
    insertAdjacentHTML.apply(this, arguments);

    if (isPattern.test(html)) {
      runForDescendants(this, recognizeElementByIsAttribute, setup);
    }
  };

  patchInnerHTML(elementPrototype);

  if (supportsNativeWebComponents) {
    patchInnerHTML(ShadowRoot.prototype);
  }
}

export default patchNativeMethods;
