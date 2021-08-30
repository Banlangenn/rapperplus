import type { IParams } from './index'


export type IReqGoodsQbf = {
  age: string;
  sex?: string;
  /**
   * 新加的 c
   */
  goods?: {
    arr: IParams<number>
  };
  goods2: IParams<string>;
};

// 怎么判断 俩是一对

export type IResGoodsQbf = {
  /**
   *
   * @value true
   */
  success: boolean;
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
      name: string;
      /**
       * 年纪
       * @value /@increment(10)
       */
      age: string;
      /**
       * 心别
       * @value /@increment(10)
       */
      sex: number;
    }[];
  };
  /**
   *
   * @value 0
   */
  code: number;
};
