// CONSTANTS
const NON_STYLE_ELEMENTS = ["script"];
const STYLIN_CONTROLLERS = ["in-def-class", "in-use-class"];

// STYLIN BOOTSTRAP
const stylinId = `stylin-${crypto.randomUUID().split("-")[0]}`;
const stylinCustomId = `stylin-${crypto.randomUUID().split("-")[0]}__custom`;

document.head.insertAdjacentHTML(
  "beforeend",
  `<style id="${stylinCustomId}"></style>\n
  <style id="${stylinId}"></style>`
);

const stylinCustomStyleElement = document.querySelector(
  `style#${stylinCustomId}`
);
const stylinStyleElement = document.querySelector(`style#${stylinId}`);

let classes = [];

// STYLIN MAIN FUNCTIONS
const getStylinControllers = (element) => {
  const attributes = new Array(...element.attributes);

  if (!attributes.length) return [];

  const stylinControllers = attributes
    .filter(({ name }) => STYLIN_CONTROLLERS.includes(name))
    .map(({ name, value }) => ({
      value,
      name: name.replace("in-", ""),
    }));

  return stylinControllers;
};

const getStylinStyles = (element) => {
  const attributes = new Array(...element.attributes);

  if (!attributes.length) return [];

  const stylinAttributes = attributes
    .filter(
      ({ name }) => name.startsWith("in-") || !STYLIN_CONTROLLERS.includes(name)
    )
    .map(({ name, value }) => ({
      value,
      name: name.replace("in-", ""),
    }));

  return stylinAttributes;
};

// STYLING ELEMENTS
const getStyle = (element, defClassNameList) => {
  const styles = getStylinStyles(element);

  if (!styles.length) return;

  const parsedStyles = styles.reduce(
    (acc, { name, value }) => `${acc}\t${name}: ${value};\n`,
    ""
  );

  const reusableClass = classes.find(
    ([, style]) => style === parsedStyles
  )?.[0];

  const styleId =
    reusableClass ??
    defClassNameList[0] ??
    `stylin-${crypto.randomUUID().split("-")[0]}`;

  const defClassName = `.${defClassNameList.join(`,\n.`) || styleId}`;

  styles.forEach(({ name }) => element.removeAttribute(`in-${name}`));

  classes.push([styleId, parsedStyles]);

  return {
    id: styleId,
    filledClass: reusableClass ? "" : `${defClassName} {\n ${parsedStyles} }\n`,
  };
};

// APPLYING CONTROLLERS
const getControllerClassNames = (element) => {
  const controllers = getStylinControllers(element);

  let useClassNameList = [];
  let defClassNameList = [];

  controllers.forEach(({ name, value }) => {
    if (name == "def-class") defClassNameList.push(value);
    if (name == "use-class") useClassNameList.push(value);
  });

  controllers.forEach(({ name }) => element.removeAttribute(`in-${name}`));

  return { defClassNameList, useClassNameList };
};

const stylinChildren = (mainElement) =>
  [...mainElement.children].forEach(stylin);

const stylin = (element) => {
  if (NON_STYLE_ELEMENTS.includes(element.localName)) return;
  stylinChildren(element);

  const { defClassNameList, useClassNameList } =
    getControllerClassNames(element);

  const styleTagElement = defClassNameList.length
    ? stylinCustomStyleElement
    : stylinStyleElement;

  const style = getStyle(element, defClassNameList);

  if (style) {
    styleTagElement.innerHTML += style.filledClass;

    useClassNameList.push(style.id);
  }

  const useClassName = useClassNameList.join(" ");

  element.className += useClassName;
};

// STYLIN INIT
stylin(document.body);
