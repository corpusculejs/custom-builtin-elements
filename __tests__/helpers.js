let index = 0;

export function generateName() {
  const name = `test-cbe-${index}`;
  index += 1;

  return name;
}

export function defineCBE(constructor, tag, name = generateName()) {
  customElements.define(name, constructor, {extends: tag});

  return name;
}
