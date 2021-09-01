/* md5: bf5ef533f55cdbd7984dbf067f34d023 */
/* eslint-disable */

/**
 * 接口名：获取商户列表
 * Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=459499&itf=2006088
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
 * Rap 地址: http://rap2.taobao.org/repository/editor?id=284428&mod=459499&itf=2033588
 */
export type IReqGoodsAudit = {
  a: string
}

export type IResGoodsAudit = {
  b: string
}
