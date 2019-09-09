if (!('customElements' in window)) {
  const fn = () => {
    throw new Error('Not implemented in this environment');
  };

  window.customElements = {
    define: fn,
    get: fn,
    upgrade: fn,
    whenDefined: fn,
  };
}
