import chalk from 'chalk';
import convert from './convert';
import { Intf, IGeneratedCode, ICreatorExtr } from '../types';
import { creatInterfaceHelpStr } from './tools';
import { getPackageName } from '../utils';
import config from './../uploadType/config';

const packageName = getPackageName();

function getFnName(url: string): null | string {
  const fnName = url.match(/\/([.a-z0-9_-]+)\/([a-z0-9_-]+$)/i);
  if (fnName && fnName.length === 3) {
    if (/^\d+\.\d+$/.test(fnName[1])) {
      return fnName[2];
    }
    return fnName[1] + fnName[2].charAt(0).toUpperCase() + fnName[2].slice(1);
  }
  return null;
}
/** 生成 Models 文件 */
export async function createModel(interfaces: Array<Intf>, extr: ICreatorExtr) {
  return await Promise.all(
    interfaces.map(async itf => {
      try {
        const [reqItf, resItf] = await convert(itf);
        const ReqType = reqItf
          .replace(/export (type|interface) Req =?/, '')
          .replace(/;/g, '')
          .replace(/\s?{}\s?/g, 'Record<string, unknown>');
        const ResType = resItf
          .replace(/export (type|interface) Res =?/, '')
          .replace(/\s?{}\s?/g, 'Record<string, unknown>');
        const fnName = getFnName(itf.url);
        if (!fnName) {
          throw new TypeError('接口路径不对,请修改合规');
        }
        const camelCaseName = `${fnName.charAt(0).toUpperCase()}${fnName.slice(1)}`;
        const tsInterface = `
          ${creatInterfaceHelpStr(extr.rapUrl, itf)}
          declare type IReq${camelCaseName} = ${ReqType}
          declare type IRes${camelCaseName} = ${ResType}
        `;
        const tsCode = `
        ${creatInterfaceHelpStr(extr.rapUrl, itf)}
        ${config.download.createRequestFuncStr({
          name: itf.name,
          repositoryId: itf.repositoryId,
          moduleId: itf.moduleId,
          interfaceId: itf.id,
          paramsType: `IReq${camelCaseName}`,
          returnType: `IRes${camelCaseName}`,
          rapUrl: `${extr.rapUrl}/repository/editor`,
          method: itf.method,
          url: `${itf.url}`,
        })}
          `;
        return {
          tsInterface,
          tsCode,
        };
      } catch (error) {
        throw chalk.red(`接口：${extr.rapUrl}/repository/editor?id=${itf.repositoryId}&mod=${itf.moduleId}&itf=${itf.id}
          生成出错
          ${error}`);
      }
    }),
  );
}

/** 生成 IResponseTypes */
export function createResponseTypes(interfaces: Array<Intf>) {
  return `
    export interface IResponseTypes {
      ${interfaces.map(
        ({ modelName }) => `
        '${modelName}': ResSelector<IModels['${modelName}']['Res']>
      `,
      )}
    }
  `;
}

// // 创建门店

export async function createBaseRequestStr(interfaces: Array<Intf>, extr: ICreatorExtr) {
  const modelArr = await createModel(interfaces, extr);
  const tsInterfaceStr = modelArr.map(e => e.tsInterface).join('\n\n');
  const tsCodeStr = modelArr.map(e => e.tsCode).join('\n\n');
  return {
    tsInterfaceStr,
    tsCodeStr: `
    import instance from "@/utils/request"
    type IResType<T extends boolean, U extends { data: any }> = T extends true
    ? U['data']
    : U

    ${tsCodeStr}

    `,
  };
}

export function createBaseIndexCode(): IGeneratedCode {
  return {
    import: `
      import { createFetch, IModels } from './request'
      import * as commonLib from '${packageName}/runtime/commonLib'
    `,
    body: `
      const { defaultFetch } = commonLib
      let fetch = createFetch({}, { fetchType: commonLib.FetchType.BASE })
    `,
    export: `
      export const overrideFetch = (fetchConfig: commonLib.RequesterOption) => {
        fetch = createFetch(fetchConfig, { fetchType: commonLib.FetchType.AUTO })
      }
      export { fetch, createFetch, defaultFetch }
      export type Models = IModels
    `,
  };
}
