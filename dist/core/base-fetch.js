"use strict";
exports.__esModule = true;
exports["default"] = "\n/**\n * search \u53C2\u6570\u8F6C\u6362\uFF0C\u6BD4\u5982 { a: 1, b: 2, c: undefined } \u8F6C\u6362\u6210 \"a=1&b=2\"\n * \u4F1A\u81EA\u52A8\u5220\u9664 undefined\n */\nfunction locationStringify(\n    obj: {\n        [key: string]: any\n    } = {}\n): string {\n    return Object.entries(obj).reduce((str, [key, value]) => {\n        if (value === undefined) {\n            return str\n        }\n        str = str ? str + '&' : str\n        return str + key + '=' + value\n    }, '')\n}\n\n/** \u8BF7\u6C42\u7C7B\u578B */\ntype REQUEST_METHOD = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH' | 'HEAD'\n\ninterface IRequestParams {\n    endpoint: string\n    method?: REQUEST_METHOD\n    params?: any\n}\n\nexport default async <Res>(params: IRequestParams): Promise<Res> => {\n    let requestUrl = params.endpoint\n    const requestParams: any = {\n        credentials: 'include',\n        method: params.method || 'GET',\n        headers: { 'Content-Type': 'application/json' },\n    }\n\n    if (requestParams.method === 'GET') {\n        requestUrl = requestUrl + '?' + locationStringify(params.params)\n    } else if (params.params) {\n        requestParams.body = JSON.stringify(params.params)\n    }\n    const res = await fetch(requestUrl, requestParams)\n    const retJSON = res.clone() // clone before return\n    return retJSON.json()\n}\n";
