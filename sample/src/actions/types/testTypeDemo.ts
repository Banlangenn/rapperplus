/* md5: 2ae460c356e8919f569dc32949752592 */
/* Rap仓库ModuleId: 477847 */

interface XY {
  x: number;
  y: number;
}

interface Shape {
  size: number;
}

interface Circle {
  shape: Shape;
  point: XY;
  radius: number;
}

type IGetRES<T> = {
  data: T;
  success: boolean;
};

/**
 * 我是描述
 * @url /c/b/w/api/1.0/user
 * @method GET
 * @rapUrl  http://rap2.taobao.org/repository/editor?id=284428&mod=477847&itf=2081705
 */
export type IGoodsQbf = {
  request: {
    age: string;
    sex?: string;
    /**
     * 新加的
     */
    goods?: {
      arr: {
        count: string;
        name: string;
      };
    };
    goods2: {
      count: string;
      name: string;
    };
  };
  response: {
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
         * @value #cname
         */
        name: string;
        /**
         * 年纪er
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
};

export type IReqGoodsAudit = Record<string, unknown>;
/**
 * 我是描述
 * @url /c/b/w/api/1.0/user/6
 * @method POST
 * @rapUrl  http://rap2.taobao.org/repository/editor?id=284428&mod=477847&itf=2081706
 */
export type IResGoodsAudit = {
  request: Circle;
  response: IGetRES<Circle>;
};

// 怎么把 success 去掉
