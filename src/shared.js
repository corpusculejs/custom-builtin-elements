export const supportsNativeWebComponents =
  'ShadowRoot' in window &&
  !('ShadyCSS' in window && !window.ShadyCSS.nativeShadow);

/**
 * Customized built-in elements registry. Contains "name => constructor"
 * associations.
 *
 * @type {Record<string, object>}
 */
export const elementsRegistry = {};

/**
 * A registry that contains the "constructor => name" associations for
 * customized built-in elements.
 *
 * @type {WeakMap<object, string>}
 */
export const elementsReversedRegistry = new WeakMap();

/**
 * A registry that associates the user constructor with the specific tag. It is
 * necessary for constructing proper HTML elements when the class is
 * instantiated with the "new" operator.
 *
 * @type {WeakMap<object, string>}
 */
export const tagsRegistry = new WeakMap();

/**
 * The polyfilled built-in constructor can work in two modes: creation mode and
 * upgrade mode. The second one requires an element instance provided to the
 * constructor for upgrade. This registry contains "constructor => element"
 * associations to serve this purpose.
 *
 * @type {WeakMap<object, Element>}
 */
export const upgradingRegistry = new WeakMap();

/**
 * A registry that contains association "polyfilledConstructor =>
 * nativeConstructor" for setting the original prototype to the used-defined
 * class.
 *
 * @type {WeakMap<object, object>}
 */
export const nativeConstructorRegistry = new WeakMap();

/**
 * A registry that contains all patched prototypes to avoid repeated patching.
 * E.g. there is class A that extends HTMLButtonElement. It is inherited with
 * the class B and class C. When the class B is registered via the
 * customElements.define, the A prototype is patched to inherit native
 * HTMLButtonElement. When C is registered, the same action performed. But we
 * already have A.prototype patched and want to avoid repeated patching. To do
 * it, during the B registration, we put the A.prototype to this registry, and
 * then won't perform patch to it anymore.
 *
 * @type {WeakSet<object>}
 */
export const patchedPrototypesRegistry = new WeakSet();

/**
 * A registry that contains already upgraded element to prevent repeated
 * upgrade.
 *
 * @type {WeakSet<object>}
 */
export const upgradedElementsRegistry = new WeakSet();

/**
 * A registry that contains the current connection state of the specific element.
 *
 * @type {WeakMap<Element, string>}
 */
export const lifecycleRegistry = new WeakMap();

export const isPattern = /\bis=(["'])?[a-z0-9_-]+\1/i;

export const $attributeChangedCallback = 'attributeChangedCallback';
export const $connectedCallback = 'connectedCallback';
export const $disconnectedCallback = 'disconnectedCallback';

export const nativeConstructorNames = [
  'HTMLAnchorElement',
  'HTMLAreaElement',
  'HTMLAudioElement',
  'HTMLBaseElement',
  'HTMLQuoteElement',
  'HTMLBodyElement',
  'HTMLBRElement',
  'HTMLButtonElement',
  'HTMLCanvasElement',
  'HTMLTableCaptionElement',
  'HTMLTableColElement',
  'HTMLDataElement',
  'HTMLDataListElement',
  'HTMLModElement',
  'HTMLDetailsElement',
  'HTMLDialogElement',
  'HTMLDivElement',
  'HTMLDListElement',
  'HTMLEmbedElement',
  'HTMLFieldSetElement',
  'HTMLFormElement',
  'HTMLHeadingElement',
  'HTMLHeadElement',
  'HTMLHRElement',
  'HTMLHtmlElement',
  'HTMLIFrameElement',
  'HTMLImageElement',
  'HTMLInputElement',
  'HTMLUnknownElement',
  'HTMLLabelElement',
  'HTMLLegendElement',
  'HTMLLIElement',
  'HTMLLinkElement',
  'HTMLMapElement',
  'HTMLMenuElement',
  'HTMLMetaElement',
  'HTMLMeterElement',
  'HTMLObjectElement',
  'HTMLOListElement',
  'HTMLOptGroupElement',
  'HTMLOptionElement',
  'HTMLOutputElement',
  'HTMLParagraphElement',
  'HTMLParamElement',
  'HTMLPreElement',
  'HTMLProgressElement',
  'HTMLScriptElement',
  'HTMLSelectElement',
  'HTMLSourceElement',
  'HTMLSpanElement',
  'HTMLStyleElement',
  'HTMLTableElement',
  'HTMLTableSectionElement',
  'HTMLTableCellElement',
  'HTMLTemplateElement',
  'HTMLTextAreaElement',
  'HTMLTimeElement',
  'HTMLTitleElement',
  'HTMLTableRowElement',
  'HTMLTrackElement',
  'HTMLUListElement',
  'HTMLVideoElement',
];
