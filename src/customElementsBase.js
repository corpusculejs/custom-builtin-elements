if (!('customElements' in window)) {
  const mock = () => {
    throw new Error('Not supported');
  };

  window.customElements = {
    define: mock,
    get: mock,
    upgrade: mock,
    // Promise that never resolves and then never wins the Promise.race.
    whenDefined: () => new Promise(() => {}),
  };
}
