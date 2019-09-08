import patchCustomElementsRegistry from './patchCustomElementsRegistry';
import patchNativeConstructors from './patchNativeConstructors';
import patchNativeMethods from './patchNativeMethods';
import {createElementObserver} from './utils';

export const initObservation = () => {
  createElementObserver(document.body);
};

export const initPolyfill = () => {
  patchNativeConstructors();
  patchCustomElementsRegistry();
  patchNativeMethods();
};
