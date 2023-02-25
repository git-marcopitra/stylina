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

  if (!attributes.length) return {};

  const stylinControllers = attributes
    .filter(({ name }) => STYLIN_CONTROLLERS.includes(name))
    .reduce(
      (acc, { name, value }) => ({
        ...acc,
        [name.replace("in-", "")]: value,
      }),
      {}
    );

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

const parseStyle = (styles) =>
  styles.reduce((acc, { name, value }) => `${acc}\t${name}: ${value};\n`, "");

const getReusableClassByStyle = (parsedStyles) =>
  classes.find(([, style]) => style === parsedStyles)?.[0];

const makeStyleId = ({ defClassName, useClassNameList, reusableClass }) => {
  const styleId = `stylin-${crypto.randomUUID().split("-")[0]}`;

  if (!defClassName && !useClassNameList.length && !reusableClass)
    return [[styleId], []];

  if (!defClassName && useClassNameList.length && !reusableClass)
    return [[...[useClassNameList.join('.')], styleId], []];

  if (!defClassName && !useClassNameList.length && reusableClass)
    return [[], [reusableClass.split(" ")]];

  if (!defClassName && useClassNameList.length && reusableClass)
    return [[useClassNameList.join('.')], [reusableClass.split(" ")]];

  if (defClassName && !useClassNameList.length && !reusableClass)
    return [[defClassName], []];

  const combinedList = [useClassNameList.join('.')].map(
    (useClassName) => `${defClassName}.${useClassName}`
  );

  return [combinedList, []];
};

const removeAttributes = ({ attributes, element }) =>
  attributes.forEach((attribute) => element.removeAttribute(attribute));

const addNewClass = (classNameList, styles) => {
  if (!classNameList.length) return;

  classes.push([classNameList.join(" "), styles]);
};

// STYLING ELEMENTS
const getStyle = ({ element, defClassName, useClassNameList }) => {
  const styles = getStylinStyles(element);
  
  if (!styles.length && !useClassNameList.length) return;
  
  const parsedStyles = parseStyle(styles);
  
  const reusableClass = getReusableClassByStyle(parsedStyles);
  
  const [styleId, reusableClassList] = makeStyleId({
    defClassName,
    useClassNameList,
    reusableClass,
  });
  
  if (styleId.length) {
    const styleTagElement = defClassName
      ? stylinCustomStyleElement
      : stylinStyleElement;

    const generatedClassName = `.${styleId.join(`,\n.`)}`;

    styleTagElement.innerHTML += `${generatedClassName} {\n ${parsedStyles} }\n`;
  }

  addNewClass(styleId, parsedStyles);

  removeAttributes({
    element,
    attributes: styles.map(({ name }) => `in-${name}`),
  });

  return [...styleId, ...reusableClassList].join(" ");
};

// APPLYING CONTROLLERS
const getControllerClassNames = (element) => {
  const controllers = getStylinControllers(element);

  const defClassName = controllers["def-class"];
  const useClassNameList = [...new Set(controllers["use-class"]?.split(","))];

  STYLIN_CONTROLLERS.forEach((controller) =>
    element.removeAttribute(controller)
  );

  return { defClassName, useClassNameList };
};

const stylinChildren = (mainElement) =>
  [...mainElement.children].forEach(stylin);

const stylin = (element) => {
  if (NON_STYLE_ELEMENTS.includes(element.localName)) return;
  stylinChildren(element);

  const { defClassName, useClassNameList } = getControllerClassNames(element);

  const styleId = getStyle({ element, defClassName, useClassNameList });

  if (styleId) element.className += styleId.replace(/\./g, " ");
};

// STYLIN INIT
stylin(document.body);

console.log(">> classes :: ", classes);
