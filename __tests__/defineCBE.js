let index = 0;

export function defineCBE(constructor, tag) {
  const name = `test-${index}`;
  index += 1;

  customElements.define(name, constructor, {extends: tag});

  return name;
}
