if (!('customElements' in window)) {
  const mock = () => {
    throw new Error('Not supported');
  };

  window.customElements = {
    define: mock,
    get: mock,
    upgrade: mock,
    whenDefined: mock,
  };
}
