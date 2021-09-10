/* md5: 9b51ca78f111b694722f4009cfdb3435 */
/* Rap仓库ModuleId: 476168 */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
import type { IReqGoodsQbf, IResGoodsQbf, IReqGoodsAudit, IResGoodsAudit } from "./types/testdemo";
import instance from "@/utils/request";
function createFetch<REQ extends Record<string, unknown>, RES extends {
    data: any;
}>(url: string, method: string) {
    return <T extends boolean = false>(data: REQ, options?: {
        proxy?: T;
        pageError?: boolean;
    }): Promise<T extends true ? RES["data"] : RES> => {
        return instance({
            url,
            method,
            data
        }, options);
    };
}

/**
* 接口名：goodsQbf
* Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=476168&itf=2078560
*/
export const goodsQbf = createFetch<IReqGoodsQbf, IResGoodsQbf>("/c/api/1.0/approve/goods/qbf", "GET");

/**
* 接口名：goodsAudit
* Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=476168&itf=2078561
*/
export const goodsAudit = createFetch<IReqGoodsAudit, IResGoodsAudit>("/c/api/1.0/approve/goods/audit", "GET");
