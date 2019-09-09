/**
 * Detects if the browser supports the Customized Built-in Elements spec.
 *
 * @returns {boolean} the result of the detection
 */
export default function detect() {
  try {
    customElements.define(
      'corpuscule-custom-builtin-elements-detector',
      document.createElement('p').constructor,
      {extends: 'p'},
    );

    return true;
  } catch (_) {
    return false;
  }
}
