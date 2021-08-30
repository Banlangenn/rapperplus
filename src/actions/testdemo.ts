/* md5: 0daacaadacbed3b4129f7b1b0e794ffd */
/* Rap仓库id: 284428 */
/* Rapper版本: 1.2.0 */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

/**
 * 本文件由 Rapper 同步 Rap 平台接口，自动生成，请勿修改
 * Rap仓库 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=459499
 */





import type { IResGoodsQbf,IResGoodsQbf  } from './types/testdemo'

import instance from '@/utils/request'

type IResType<T extends boolean, U extends {data: any}> = T extends true ? U['data'] : U

/**
 * 接口名：获取商户列表
 * Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=459499&itf=2006088
 */
export const goodsQbfApi = <T extends boolean = false>(
  data: IReqGoodsQbf,
  options?: {
    proxy?: T
    pageError?: boolean
  }
): Promise<IResType<T, IResGoodsQbf>> =>
  instance(
    {
      url: '/c/api/1.0/approve/goods/qbf',
      method: 'GET',
      data,
    },
    options
  ) as Promise<any>

/**
 * 接口名：2接口
 * Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=459499&itf=2033588
 */
export const goodsAuditApi = <T extends boolean = false>(
  data: IReqGoodsAudit,
  options?: {
    proxy?: T
    pageError?: boolean
  }
): Promise<IResType<T, IResGoodsAudit>> => {
  
  return instance(
    {
      url: '/c/api/1.0/approve/goods/audit',
      method: 'GET',
      data,
    },
    options
  ) as Promise<any>
}
  

  const a = 0

 