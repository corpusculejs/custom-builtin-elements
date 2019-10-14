import {CustomBuiltInElementsRegistry} from './CustomBuiltInElementsRegistry';

export const supportsNativeWebComponents =
  'ShadowRoot' in window &&
  !('ShadyCSS' in window && !window.ShadyCSS.nativeShadow);

/**
 * Customized built-in elements registry.
 * @see {CustomBuiltInElementsRegistry}
 */
export const elementsRegistry = new CustomBuiltInElementsRegistry();

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
 * @type {WeakMap<object, number>}
 */
export const patchedPrototypesRegistry = new WeakMap();

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
  'Anchor',
  'Area',
  'Audio',
  'Base',
  'Quote',
  'Body',
  'BR',
  'Button',
  'Canvas',
  'TableCaption',
  'TableCol',
  'Data',
  'DataList',
  'Mod',
  'Details',
  'Dialog',
  'Div',
  'DList',
  'Embed',
  'FieldSet',
  'Form',
  'Heading',
  'Head',
  'HR',
  'Html',
  'IFrame',
  'Image',
  'Input',
  'Unknown',
  'Label',
  'Legend',
  'LI',
  'Link',
  'Map',
  'Menu',
  'Meta',
  'Meter',
  'Object',
  'OList',
  'OptGroup',
  'Option',
  'Output',
  'Paragraph',
  'Param',
  'Pre',
  'Progress',
  'Script',
  'Select',
  'Source',
  'Span',
  'Style',
  'Table',
  'TableSection',
  'TableCell',
  'Template',
  'TextArea',
  'Time',
  'Title',
  'TableRow',
  'Track',
  'UList',
  'Video',
];
