/* md5: 6cfa81aa6b2d158995fa883e75053a03 */
/* Rap仓库id: 284428 */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

/**
 * 本文件由 Rapper 同步 Rap 平台接口，自动生成，请勿修改
 * Rap仓库 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=474869
 */

import type {IReqGoodsQbf, IResGoodsQbf, IReqGoodsAudit, IResGoodsAudit} from './types/testdemo'

// @ts-ignore
import instance from '@/utils/request'

function createFetch<REQ extends Record<string, unknown>, RES extends {data: any}>(url: string, method: string) {
  return <T extends boolean = false>(
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

/**
 * 接口名：获取商户列表
 * Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=474869&itf=2065363
 */
export const goodsQbf = createFetch<IReqGoodsQbf, IResGoodsQbf>('/c/api/1.0/approve/goods/qbf', 'GET')

/**
 * 接口名：2接口
 * Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=474869&itf=2065364
 */
export const goodsAudit = createFetch<IReqGoodsAudit, IResGoodsAudit>('/c/api/1.0/approve/goods/audit', 'GET')
