// CONSTANTS
const NON_STYLE_ELEMENTS = ["script"];
const STYLIN_CONTROLLERS = ["in-def-class", "in-use-class"];

// STYLIN BOOTSTRAP
const stylinId = `stylin-${crypto.randomUUID().split("-")[0]}`;

document.head.insertAdjacentHTML(
  "beforeend",
  `<style id="${stylinId}"></style>`
);

const stylinStyleElement = document.querySelector(`style#${stylinId}`);

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

  const styleId = `stylin-${crypto.randomUUID().split("-")[0]}`;

  defClassNameList.push(styleId);

  console.log(">> defClassNameList :: ", defClassNameList);

  const defClassName = `.${defClassNameList.join(`,\n.`)}`;

  styles.forEach(({ name }) => element.removeAttribute(`in-${name}`));

  return {
    id: styleId,
    filledClass: `${defClassName} {\n ${parsedStyles} }\n`,
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

  const style = getStyle(element, defClassNameList);

  if (style) {
    stylinStyleElement.innerHTML += style.filledClass;

    useClassNameList.push(style.id);
  }

  const useClassName = useClassNameList.join(" ");

  element.className += useClassName;
};

// STYLIN INIT
stylin(document.body);
