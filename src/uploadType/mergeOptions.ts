
import type { IFuncInfo, ITypeName } from './requestFileParse'
import *  as path from 'path'
import { searchRootPath } from './../utils'
function completionOptions(options:IOptions = {download: {}, upload: {}}) {
    const defaultOptions = {
      download: {
        //请求 function 模板
        requestFunc(params) {
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
          const fnName = getFnName(params.requestUrl);
          if (!fnName) {
            throw new TypeError('接口路径不对,请修改合规');
          }
          const camelCaseName = `${fnName.charAt(0).toUpperCase()}${fnName.slice(1)}`;
          const reqTypeName = `IReq${camelCaseName}`;
          const resTypeName = `IRes${camelCaseName}`;
          return {
            reqTypeName,
            resTypeName,
            funcMain: `
              /**
               * 接口名：${params.funcDescription}
               * Rap 地址: ${params.rapUrl}?id=${params.repositoryId}&mod=${params.moduleId}&itf=${params.interfaceId}
               */
              export const ${fnName} = createFetch<${reqTypeName}, ${resTypeName}>('${params.requestUrl}', '${params.requestMethod}')
              `,
          };
        },
        //请求 函数共工头（用于引入函数
        requestModule(params) {
          return {
            fileName: params.moduleDescription,
            moduleHeader: `
            // @ts-ignore
            import instance from '@/utils/request'
          
            function createFetch<REQ extends Record<string, unknown>, RES extends {data: any}> (url: string, method: string) {
              return  <T extends boolean = false>(
                data: REQ,
                options?: {
                  proxy?: T
                  pageError?: boolean
                }
              ): Promise<T extends true ? RES['data'] : RES> => {
                return instance(
                  {
                    url,
                    method,
                    data,
                  },
                  options
                )
              }
            }
          
            `,
          };
        },
      },
      rap: {
        // 拉取接口地址
        apiUrl:
          'http://rap2api.taobao.org/repository/get?id=284428&token=TTDNJ7gvXgy9R-9axC-7_mbi4ZxEPlp6',
        /** rap 前端地址，默认是 http://rap2.taobao.org */
        rapUrl: 'http://rap2.taobao.org',
        rapperPath: './src/actions',
        tokenCookie:
        'aliyungf_tc=ed5eefe153b8cd6d7a9b0ea3f4aaaa92eaf022825c19857a2b435978264d17d8; koa.sid=oH6bicTb16BOTnZO7fFRBC3rEZ7vE1VI; koa.sid.sig=i_5lxqH54ByrLD8fNo_uhMyjR4c',
        repositoryId: 284428,
      },
      upload: {

        formatFunc(params) {
          // createFetch<IReqGoodsQbf, IResGoodsQbf>('/c/api/1.0/approve/goods/qbf', 'GET')
          const[_, reqTypeName, resTypeName, reqUrl, reqMethod]  = params.body.match(/createFetch<(\w+),\s+(\w+)>\(['|"]([\s|\S]+)['|"], ['|"]([a-zA-Z]+)['|"]\)/)

          if(!reqTypeName || !resTypeName){
            return null
          }
          const matchInterfaceId= params.comment.match(/http:\/\/rap2\.tao[\s\S]+&itf=(\d+)/)
          return {
            resTypeName,
            reqTypeName,
            // 如果返回 null '' undefined 0 等 就会被认为是新的接口，会触发上rap操作
            interfaceId: matchInterfaceId? Number(matchInterfaceId[1]) : null,
            reqUrl: reqUrl,
            reqMethod: reqMethod,
          };
        },
        // webpack 别名 alias 绝对路径
        alias: {
          '@': './src',
        },
      }
    }

    const _options:IOptions = {}
    _options.download = {
        ...(options.download || {}),
        ...defaultOptions.download
    }
    _options.upload = {
        ...(options.upload || {}),
        ...defaultOptions.upload
    }
    _options.rap = {
      ...(options.upload || {}),
      ...defaultOptions.rap
  }

    const rootPath = searchRootPath()
    if(!rootPath) {
      process.exit(1)
    }
  
    // _options.upload.matchDir = path.resolve(rootPath, _options.upload.matchDir)
    _options.rap.rapperPath = path.resolve(rootPath, _options.rap.rapperPath)
    const alias = _options.upload.alias
    for(const v in alias) {
      _options.upload.alias.v = path.resolve(rootPath, alias[v])
    }
    return _options
}

// 文件缓存  增速


export interface IOptions {
    download?: {
        requestFunc?: (params: {
            funcDescription: string;
            repositoryId: number;
            moduleId: number;
            interfaceId: number;
            requestUrl: string;
            requestMethod: string;
            rapUrl: string;
        }) => {
            reqTypeName: string;
            resTypeName: string;
            funcMain: string
        };
        requestModule?: (params: {
            repositoryId: number;
            moduleId: number;
            moduleRapUrl: string;
            moduleDescription: string
        }) => {
            fileName: string;
            moduleHeader: string;
        };
        moduleId?: number;
    }
    rap?: {
      // 拉取接口地址
      apiUrl?: string;
      /** rap 前端地址，默认是 http://rap2.taobao.org */
      rapUrl?:string;
      rapperPath?: string;
      tokenCookie?:string;
      repositoryId?: number,
    },
     upload?: {
        formatFunc?: (params: IFuncInfo) => ITypeName;
        moduleId?: number;
        alias?: Record<string, string>;
    }
}

export  default function defineConfig(options: IOptions) {
    return  completionOptions(options)
}


