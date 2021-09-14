/* Rap仓库ModuleId: 477847 */ 

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

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

import type { IGoodsQbf, IResGoodsAudit } from "@/actions/types/testTypeDemo.ts";
  
/**
 * 接口名：我是描述
 * Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=477847&itf=2081705
 */
export const iGoodsQbfTestTypeDemo = createFetch<IGoodsQbf['request'], IGoodsQbf['response']>("/c/b/w/api/1.0/user", "GET");

/**
 * 接口名：我是描述
 * Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=477847&itf=2081706
 */
export const iResGoodsAuditTestTypeDemo = createFetch<IResGoodsAudit['request'], IResGoodsAudit['response']>("/c/b/w/api/1.0/user/6", "POST");
