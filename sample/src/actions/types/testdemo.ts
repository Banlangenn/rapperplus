/* md5: e8f35813847faeb59c5f850a1d53f247 */
/* eslint-disable */
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
       * @value #cname
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

export type IReqGoodsAudit = Record<string, unknown>
export type IResGoodsAudit = {
  cb: string
}
