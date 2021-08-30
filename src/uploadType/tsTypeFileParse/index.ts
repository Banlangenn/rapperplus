import * as TJS from 'typescript-json-schema';

const settings = {
  required: true,
  comments: true,
  validationKeywords: ['value', 'rule'],
};
const compilerOptions = {
  strictNullChecks: true,
};

// console.log('开始工作....');

// const program = TJS.getProgramFromFiles([path.join(__dirname, typeFile)], compilerOptions, './');
// const schema = TJS.generateSchema(program, '*', settings);

export function tsTypeParse(file: string) {
  const program = TJS.getProgramFromFiles([file], compilerOptions, './');
  return TJS.generateSchema(program, '*', settings);
}
let IDX = 1;
// const ifs = []

function generateRapJson(
  definitions: {
    [key: string]: any;
  },
  currentDefinitions: any,
  scope: 'request' | 'response',
  parentId: number | string,
  interfaceId: number,
  name: string,
) {
  if (!currentDefinitions) {
    throw new Error(`${name} 出现了一个错误，类型未找到`);
  }
  const ifs = [];
  // in 什么都能循环
  const obj = currentDefinitions;
  const isObject = obj?.type === 'object';
  //
  const properties = isObject ? obj.properties : obj.items.properties;

  const required = (isObject ? obj.required : obj.items.required) || [];

  for (const key in properties) {
    let element = properties[key];
    if (element['$ref']) {
      // 有泛型
      const genericName = element['$ref'];
      element = genericName.replace(/^#\//, '').split('/');

      element.shift();

      element = element.reduce((c, n) => {
        return c[n];
      }, definitions);
    }
    // 第一层肯定是一个obk
    const id = `$memory-${IDX}`;
    const type = element.enum ? typeof element.enum[0] : element.type;
    const ifItem = {
      scope,
      name: key,
      type: type.charAt(0).toUpperCase() + type.slice(1),
      value:
        typeof element.value === 'string'
          ? element.value.replace(/^(#|\\@|\/@)/, '@')
          : JSON.stringify(element.value) || '',
      description: element.description || '',
      parentId,
      interfaceId,
      id: id,
      pos: 2,
      required: required.includes(key),
      rule: element.rule || '',
      memory: true,
    };
    ifs.push(ifItem);
    IDX++;
    if (element.type === 'object' || element.type === 'array') {
      ifs.push(...generateRapJson(definitions, element, scope, id, interfaceId, key));
    }
  }
  return ifs;
}

export function generateUploadRapJson(
  schema: TJS.Definition,
  interfaceId: number,
  responseTypeName: string,
  requestTypeName: string,
) {
  const parentId = -1;
  IDX = 1;
  return generateRapJson(
    schema.definitions,
    schema.definitions[responseTypeName],
    'response',
    parentId,
    interfaceId,
    responseTypeName,
  ).concat(
    generateRapJson(
      schema.definitions,
      schema.definitions[requestTypeName],
      'request',
      parentId,
      interfaceId,
      requestTypeName,
    ),
  );
}
