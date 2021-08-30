// cnpm install  typescript-json-schema  node-fetch

const TJS = require('typescript-json-schema');
const path = require('path');
// const fs = require('fs');
const fetch = require('node-fetch');

const settings = {
  required: true,
  comments: true,
  validationKeywords: ['value', 'rule'],
};
const compilerOptions = {
  strictNullChecks: true,
};

// console.log('开始工作....');
const typeFile = './actions/types/testdemo.ts';
const program = TJS.getProgramFromFiles([path.join(__dirname, typeFile)], compilerOptions, './');
const schema = TJS.generateSchema(program, '*', settings);

console.log(JSON.stringify(schema));
console.log('类型生成 json 成功');

// const output_path = './file.json'
// const schemaString = JSON.stringify(schema, null, 2);
// fs.writeFile(output_path, schemaString, (err) => {
//     if (err) throw err;
// });

// const ifs = []
let IDX = 1;
parentId = -1;
const interfaceId = '2006088';

function updateInterface(properties, interfaceId) {
  fetch(`http://rap2api.taobao.org/properties/update?itf=${interfaceId}`, {
    headers: {
      'content-type': 'application/json',
      cookie:
        'aliyungf_tc=ed5eefe153b8cd6d7a9b0ea3f4aaaa92eaf022825c19857a2b435978264d17d8; koa.sid=ZTL0fFjvQuUK3xyWm2H-smsOVJNxRsjt; koa.sid.sig=5zQEi0OIcv51taQInKVpVLWOK1s',
    },
    body: JSON.stringify({ properties, summary: { bodyOption: 'FORM_DATA', posFilter: 2 } }),
    method: 'POST',
  })
    .then(e => e.json())
    .then(e => {
      if (e.isOk || e.data) {
        console.log('提交服务器成功');
      } else {
        console.log('失败', e.errMsg);
      }
    })
    .catch(err => {
      console.log('失败', err);
    });
}

function genifs(obj, scope, parentId, interfaceId) {
  const ifs = [];
  // in 什么都能循环
  const isObject = obj.type === 'object';
  const properties = isObject ? obj.properties : obj.items.properties;
  const required = (isObject ? obj.required : obj.items.required) || [];

  console.log(properties);
  for (const key in properties) {
    const element = properties[key];
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
      ifs.push(...genifs(element, scope, id, interfaceId));
    }
    // if (element.type === 'array') {
    //   ifs.push(...genifs(element, scope, id, interfaceId));
    // }
  }
  return ifs;
}

const properties = genifs(schema.definitions.IReqGoodsQbf, 'request', parentId, interfaceId).concat(
  genifs(schema.definitions.IResGoodsQbf, 'response', parentId, interfaceId),
);
console.log('json转 rap-properties 成功');
updateInterface(properties, interfaceId);
