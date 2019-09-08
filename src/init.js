import patchCustomElementsRegistry from './patchCustomElementsRegistry';
import patchNativeConstructors from './patchNativeConstructors';
import patchNativeMethods from './patchNativeMethods';
import {createElementObserver} from './utils';

export function initObservation() {
  createElementObserver(document.body);
}

export function initPolyfill() {
  patchNativeConstructors();
  patchCustomElementsRegistry();
  patchNativeMethods();
}
