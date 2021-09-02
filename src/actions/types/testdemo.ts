/* md5: d228c21612b7a472df4e286eddf50674 */
/* eslint-disable */

/**
 * 接口名：获取商户列表
 * Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=474869&itf=2066499
 */
export type IReqGoodsQbf = {
  age: string
  sex?: string
  /**
   * 新加的 c
   */
  goods?: {
    arr: {
      count: string
      name: string
    }
  }
  goods2: {
    count: string
    name: string
  }
}

export type IResGoodsQbf = {
  /**
   *
   * @value true
   */
  success: boolean
  data: {
    /**
     * 数组演示
     * @rule 5
     */
    array: {
      /**
       * n名称
       * @value /@cname
       */
      name: string
      /**
       * 年纪
       * @value /@increment(10)
       */
      age: string
      /**
       * 心别
       * @value /@increment(10)
       */
      sex: number
    }[]
  }
  /**
   *
   * @value 0
   */
  code: number
}

/**
 * 接口名：2接口
 * Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=474869&itf=2066668
 */
export type IReqGoodsAudit = Record<string, unknown>
export type IResGoodsAudit = {
  b: string
}
