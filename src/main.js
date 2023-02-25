const NON_STYLE_ELEMENTS = ["script"];

const getStylinStyles = (element) => {
  const attributes = new Array(...element.attributes);

  if (!attributes.length) return [];

  const stylinAttributes = attributes
    .filter(({ name }) => name.startsWith("in-"))
    .map(({ name, value }) => ({
      value,
      name: name.replace("in-", ""),
    }));

  return stylinAttributes;
};

const stylinChildren = (mainElement) =>
  [...mainElement.children].forEach(stylin);

const stylin = (element) => {
  if (NON_STYLE_ELEMENTS.includes(element.localName)) return;

  stylinChildren(element);
  const styles = getStylinStyles(element);

  if (!styles.length) return;

  const id = `stylin-${crypto.randomUUID().split("-")[0]}`;

  const parsedStyles = styles.reduce(
    (acc, { name, value }) => `${acc}
    ${name}: ${value};
  `,
    ""
  );

  element.className += id;
  element.insertAdjacentHTML(
    "beforebegin",
    `<style>.${id} { ${parsedStyles} }</style>`
  );
  styles.forEach(({ name }) => element.removeAttribute(`in-${name}`));
};

stylin(document.body);
