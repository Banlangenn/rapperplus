import * as path from 'path';
import { uploadInterface } from './fetch/index';
import { generateUploadRapJson, tsTypeParse } from './tsTypeFileParse/index';
import { requestFileParse } from './requestFileParse';
const requestFile = './../actions/testdemo.ts';
const tokenCookie =
  'aliyungf_tc=ed5eefe153b8cd6d7a9b0ea3f4aaaa92eaf022825c19857a2b435978264d17d8; koa.sid=dsNpDab96kNaeDLPVH4sEgBhU8kj3AIX; koa.sid.sig=7jaNtsiDH-hlQjrY1EVTPCyIhFg';
// const interfaceId = 2006088;

const { importType, typeName } = requestFileParse(path.resolve(__dirname, requestFile), params => ({
  returnType: params.returnType.match(/T,\s*(\w+)>>$/)[1],
  paramsType: params.paramsType[0].data,
  fetchUrl: params.comment.match(/http:\/\/rap2\.tao[\s\S]+&itf=\d+/)[0],
}));

const typeFileJsonMap = {};
typeName
  .filter(name => name)
  .map(e => {
    if (importType.importNames.includes(e.paramsType && e.returnType)) {
      // 在这个文件内
      if (!typeFileJsonMap[importType.importPath]) {
        typeFileJsonMap[importType.importPath] = tsTypeParse(
          path.resolve(__dirname, importType.importPath),
        );
      }

      const interfaceId = Number(e.fetchUrl.match(/\d+$/)[0]);
      const rapJson = generateUploadRapJson(
        typeFileJsonMap[importType.importPath],
        interfaceId,
        e.returnType,
        e.paramsType,
      );

      uploadInterface(rapJson, interfaceId, tokenCookie);
    }
  });
