import type { IFuncInfo, ITypeName } from './requestFileParse'
export default {
  download: {
    //请求 function 模板

    createRequestFuncStr: (params: {
      name: string
      repositoryId: number;
      moduleId: number;
      interfaceId: number;
      paramsType: string;
      returnType: string;
      url: string;
      method: string;
      rapUrl: string
    }) => {
      return `
      /**
       * 接口名：${params.name}
       * Rap 地址: ${params.rapUrl}?id=${params.repositoryId}&mod=${params.moduleId}&itf=${params.interfaceId}
       */
      export const goodsAuditApi = <T extends boolean = false>(
        data: ${params.paramsType},
        options?: {
          proxy?: T
          pageError?: boolean
        }
      ): Promise<IResType<T, ${params.returnType}>> => {
        
        return instance(
          {
            url: '${params.url}',
            method: '${params.method}',
            data,
          },
          options
        ) as Promise<any>
      }
      `;
    },
    //请求 函数共工头（用于引入函数
    createBaseRequestStr: `
    import instance from '@/utils/request'
  
    type IResType<T extends boolean, U extends {data: any}> = T extends true ? U['data'] : U
  
    `,
    // webpack 别名 alias 绝对路径
    alias: {
      '@': './src',
    },
    rap: {
      apiUrl:'http://rap2api.taobao.org/repository/get?id=284428&token=TTDNJ7gvXgy9R-9axC-7_mbi4ZxEPlp6',
      /** rap 前端地址，默认是 http://rap2.taobao.org */
      rapUrl:'http://rap2.taobao.org',
      rapperPath:'./actions',
    },
  },
  upload: {
    // 根据函数信息 过滤出 有用信息
    formatFunc: (params: IFuncInfo):ITypeName => {
      return {
        returnType: params.returnType.match(/T,\s*(\w+)>>$/)[1],
        paramsType: params.paramsType[0].data,
        fetchUrl: params.comment.match(/http:\/\/rap2\.tao[\s\S]+&itf=\d+/)[0],
      }
    },
    // 上传 token
    tokenCookie: 'aliyungf_tc=ed5eefe153b8cd6d7a9b0ea3f4aaaa92eaf022825c19857a2b435978264d17d8; koa.sid=dsNpDab96kNaeDLPVH4sEgBhU8kj3AIX; koa.sid.sig=7jaNtsiDH-hlQjrY1EVTPCyIhFg',
    //会递归遍历啊所有附和 当前文件的 文件
    uploadMatch: './src/actions'
  },
};

// 文件缓存  增速


