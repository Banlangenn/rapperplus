const fetch = require('node-fetch');

// 更新接口
export function updateInterface(
  params: { properties: any; id: number },
  rapUrl: string,
  cookie: string,
): Promise<any> {
  return fetch(`${rapUrl}/properties/update?itf=${params.id}`, {
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

// 创建接口
export function createInterface(
  params: {
    name: string;
    url: string;
    method: string;
    description?: string;
    moduleId: number;
    repositoryId: number;
  },
  rapUrl: string,
  cookie: string,
) {
  return fetch(`${rapUrl}/interface/create`, {
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
      return e;
    })

    .catch(err => {
      throw new Error(err);
    });
}

// 删除接口
export function deleteInterface({ id }: { id: number }, rapUrl: string, cookie: string) {
  return fetch(`${rapUrl}/interface/remove?id=${id}`, {
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
export function deleteModule({ id }: { id: number }, rapUrl: string, cookie: string) {
  fetch(`${rapUrl}/module/remove?id=${id}`, {
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
export function createModule(
  params: {
    description: string;
    name: number;
    repositoryId: string;
  },
  rapUrl,
  cookie,
): Promise<any> {
  return fetch(`${rapUrl}/module/create`, {
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
      return e;
    })

    .catch(err => {
      throw new Error(err);
    });
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
