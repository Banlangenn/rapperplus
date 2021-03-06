const fetch = require('node-fetch');
import { URL } from 'url';
// 更新接口
export function updateInterface(
  params: { properties: any; id: number },
  funcName: string,
  apiUrl: string,
  cookie: string,
): Promise<any> {
  return fetch(`${new URL(apiUrl).origin}/properties/update?itf=${params.id}`, {
    headers: {
      'content-type': 'application/json',
      cookie,
    },
    body: JSON.stringify({
      properties: params.properties,
      summary: { bodyOption: 'FORM_DATA', posFilter: 2 },
    }),
    method: 'POST',
  })
    .then(e => {
      if (e.status !== 200) {
        if (e.status === 500) {
          throw new Error(
            `接口更新失败，请检查：${funcName}(${params.id})对应的远程接口是不是删除了`,
          );
        }
        throw new Error(e.statusText);
      }
      return e.json();
    })
    .then(e => {
      if (e.isOk || e.data) {
        return e.data;
      } else {
        throw e.errMsg;
      }
    })

    .catch(err => {
      throw err;
    });
}

// 创建接口
export async function createInterface(
  params: {
    name: string;
    url: string;
    method: string;
    description?: string;
    moduleId: number;
    repositoryId: number;
  },
  apiUrl: string,
  cookie: string,
) {
  const data = await fetch(`${new URL(apiUrl).origin}/interface/create`, {
    headers: {
      'content-type': 'application/json',
      cookie,
    },
    body: JSON.stringify(params),
    method: 'POST',
  })
    .then(e => {
      if (e.status !== 200) {
        throw new Error(e.statusText);
      }
      return e.json();
    })
    .then(e => {
      if (e.isOk || e.data) {
        return e.data;
      } else {
        throw e.errMsg;
      }
    })
    .catch(err => {
      throw err;
    });
  return data;
}

// 删除接口
export function deleteInterface({ id }: { id: number }, apiUrl: string, cookie: string) {
  return fetch(`${new URL(apiUrl).origin}/interface/remove?id=${id}`, {
    headers: {
      cookie,
    },
    method: 'GET',
  })
    .then(e => {
      if (e.status !== 200) {
        throw new Error(e.statusText);
      }
      return e.json();
    })
    .then(e => {
      if (e.isOk || e.data) {
      } else {
        throw new Error(e.errMsg);
      }
    })

    .catch(err => {
      throw new Error(err);
    });
}
// 删除模块
export function deleteModule({ id }: { id: number }, apiUrl: string, cookie: string) {
  fetch(`${new URL(apiUrl).origin}/module/remove?id=${id}`, {
    headers: {
      'content-type': 'application/json',
      cookie,
    },
    method: 'GET',
  })
    .then(e => {
      if (e.status !== 200) {
        throw new Error(e.statusText);
      }
      return e.json();
    })
    .then(e => {
      if (e.isOk || e.data) {
      } else {
        throw new Error(e.errMsg);
      }
    })

    .catch(err => {
      throw new Error(err);
    });
}

// 创建模块
export async function createModule(
  params: {
    description: string;
    name: string;
    repositoryId: number;
  },
  apiUrl,
  cookie,
): Promise<any> {
  const data = await fetch(`${new URL(apiUrl).origin}/module/create`, {
    headers: {
      'content-type': 'application/json',
      cookie,
    },
    body: JSON.stringify(params),
    method: 'POST',
  })
    .then(e => {
      if (e.status !== 200) {
        throw new Error(e.statusText);
      }
      return e.json();
    })
    .then(e => {
      if (e.isOk || e.data) {
        return e.data;
      } else {
        throw e.errMsg;
      }
    })

    .catch(err => {
      throw new Error(err);
    });
  return data;
}

// type MatchPair<S extends string> = S extends `/${infer A}/${infer B}` ? [A, B] : unknown;
// type T20 = MatchPair<'/a/c'>; // ['1', '2']
// type T21 = MatchPair<'[foo,bar]'>; // ['foo', 'bar']

// createInterface({
//   name: '我很长很长很长-------2',
//   url: '/ceshi/interface3',
//   description: '测试接口',
//   moduleId: 475097,
//   repositoryId: 284428,
//   method: 'GET',
// });
