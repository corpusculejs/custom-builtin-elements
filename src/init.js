import patchCustomElementRegistry from './patchCustomElementRegistry';
import patchNativeConstructors from './patchNativeConstructors';
import patchNativeMethods from './patchNativeMethods';
import {createElementObserver} from './utils';

export function initObservation() {
  createElementObserver(document.body);
}

export function initPolyfill() {
  patchNativeConstructors();
  patchCustomElementRegistry();
  patchNativeMethods();
}
