import './detect';
import {initObservation, initPolyfill} from './init';

initPolyfill();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initObservation);
} else {
  initObservation();
}
